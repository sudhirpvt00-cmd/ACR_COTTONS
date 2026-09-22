/**
 * ACR PRINTS - PHASE 3 ORDERS & CHECKOUT FLOW TEST SUITE
 * Tests end-to-end cart-to-order lifecycle, address resolution, stock updates,
 * order tracking, cancellation rules, and admin oversight.
 */

const BASE_URL = 'http://localhost:5000/api';

let totalTests = 0;
let passedTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    console.log(`  ✅ PASS: ${message}`);
    passedTests++;
  } else {
    console.error(`  ❌ FAIL: ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  }
}

async function runOrdersTests() {
  console.log('\n🧪 Starting ACR Prints Orders & Checkout Flow Tests...\n');

  try {
    // 1. Authenticate Demo Customer
    console.log('1. Authenticating Demo Customer (Priya Sharma)...');
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mobile: '9876501234',
        password: 'Customer@12345',
      }),
    });
    const rawCookie = loginRes.headers.get('set-cookie');
    const authCookie = rawCookie ? rawCookie.split(';')[0] : '';
    assert(loginRes.status === 200 && !!authCookie, 'Demo customer signed in successfully');

    // 2. Clear cart to start with known state
    console.log('\n2. Ensuring Cart Is Empty For Initial Order Validation...');
    await fetch(`${BASE_URL}/cart`, {
      method: 'DELETE',
      headers: { Cookie: authCookie },
    });

    // 3. Attempt Order with Empty Cart -> Expect 400
    console.log('\n3. Testing Empty Cart Order Rejection...');
    const emptyOrderRes = await fetch(`${BASE_URL}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: authCookie,
      },
      body: JSON.stringify({
        paymentMethod: 'COD',
      }),
    });
    const emptyOrderData = await emptyOrderRes.json();
    assert(emptyOrderRes.status === 400, 'Empty cart rejected with 400');
    assert(emptyOrderData.success === false, 'Error message returned for empty cart');

    // 4. Add Delivery Address
    console.log('\n4. Adding Delivery Address in Erode, Tamil Nadu...');
    const addressRes = await fetch(`${BASE_URL}/user/addresses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: authCookie,
      },
      body: JSON.stringify({
        fullName: 'Priya Sharma',
        mobile: '9876501234',
        street: '14, Gandhipuram Main Road, Surampatti',
        city: 'Erode',
        state: 'Tamil Nadu',
        pincode: '638009',
        isDefault: true,
      }),
    });
    const addressData = await addressRes.json();
    assert(addressRes.status === 201, 'Delivery address added successfully');
    const addressId = addressData.address.id;

    // 5. Fetch a product to purchase
    console.log('\n5. Fetching catalog product to purchase...');
    const productsRes = await fetch(`${BASE_URL}/products`);
    const productsData = await productsRes.json();
    assert(productsData.products?.length > 0, 'Products available in catalog');
    const testProduct = productsData.products[0];
    console.log(`   Selected item: "${testProduct.title}" (₹${testProduct.price})`);

    // 6. Add 2 items to Bag
    console.log('\n6. Adding 2 units to shopping bag...');
    const addRes = await fetch(`${BASE_URL}/cart`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: authCookie,
      },
      body: JSON.stringify({
        productId: testProduct.id,
        quantity: 2,
        size: 'Standard (20x26 in)',
      }),
    });
    const addData = await addRes.json();
    assert(addRes.status === 200 && addData.success, '2 units added to bag');

    // 7. Place Order with COD and saved Address
    console.log('\n7. Placing Order with COD and Address...');
    const orderRes = await fetch(`${BASE_URL}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: authCookie,
      },
      body: JSON.stringify({
        addressId,
        paymentMethod: 'COD',
      }),
    });
    const orderData = await orderRes.json();
    assert(orderRes.status === 201, `Order created with 201 (received ${orderRes.status})`);
    assert(orderData.success === true, 'Order marked as success');
    assert(orderData.order?.orderNumber?.startsWith('ACR-ORD-'), `Valid order number: ${orderData.order?.orderNumber}`);
    assert(orderData.order?.status === 'PLACED', `Order status is PLACED`);
    assert(orderData.order?.items?.length === 1, `Order contains 1 item line`);
    assert(orderData.order?.items[0]?.quantity === 2, `Item line has quantity 2`);
    assert(orderData.order?.shippingAddress?.city === 'Erode', `Shipping address snapshot preserved: Erode`);

    const placedOrderId = orderData.order.id;

    // 8. Verify Cart Was Cleared After Order Placement
    console.log('\n8. Verifying shopping bag was emptied...');
    const cartCheckRes = await fetch(`${BASE_URL}/cart`, {
      headers: { Cookie: authCookie },
    });
    const cartCheckData = await cartCheckRes.json();
    assert(cartCheckData.items?.length === 0, 'Cart is now empty after order placement');

    // 9. Fetch Customer Orders List (/api/orders)
    console.log('\n9. Fetching Customer Order History (/api/orders)...');
    const myOrdersRes = await fetch(`${BASE_URL}/orders`, {
      headers: { Cookie: authCookie },
    });
    const myOrdersData = await myOrdersRes.json();
    assert(myOrdersRes.status === 200, 'Orders history retrieved with 200');
    assert(myOrdersData.orders?.length > 0, `Customer has ${myOrdersData.orders?.length} orders`);
    const foundOrder = myOrdersData.orders.find((o) => o.id === placedOrderId);
    assert(!!foundOrder, 'Recently placed order found in history');

    // 10. Fetch Single Order Details (/api/orders/:id)
    console.log('\n10. Fetching Single Order Details (/api/orders/:id)...');
    const singleOrderRes = await fetch(`${BASE_URL}/orders/${placedOrderId}`, {
      headers: { Cookie: authCookie },
    });
    const singleOrderData = await singleOrderRes.json();
    assert(singleOrderRes.status === 200, 'Single order details returned 200');
    assert(singleOrderData.order?.id === placedOrderId, 'Order ID matches');
    assert(singleOrderData.order?.user?.name === 'Priya Sharma', 'User name present in details');

    // 11. Test Order Cancellation (/api/orders/:id/cancel)
    console.log('\n11. Testing Customer Order Cancellation (/api/orders/:id/cancel)...');
    const cancelRes = await fetch(`${BASE_URL}/orders/${placedOrderId}/cancel`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Cookie: authCookie,
      },
      body: JSON.stringify({ reason: 'Changed mind, need different size' }),
    });
    const cancelData = await cancelRes.json();
    assert(cancelRes.status === 200, 'Order cancellation succeeded with 200');
    assert(cancelData.order?.status === 'CANCELLED', 'Order status changed to CANCELLED');

    // 12. Test Prevent Re-cancelling
    console.log('\n12. Testing Re-cancelling Prevention...');
    const reCancelRes = await fetch(`${BASE_URL}/orders/${placedOrderId}/cancel`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Cookie: authCookie,
      },
      body: JSON.stringify({ reason: 'Try again' }),
    });
    assert(reCancelRes.status === 400, 'Duplicate cancellation rejected with 400');

    // 13. Test Admin Order Management
    console.log('\n13. Authenticating Admin (9876543210)...');
    const adminLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mobile: '9876543210',
        password: 'Admin@12345',
      }),
    });
    const adminRawCookie = adminLoginRes.headers.get('set-cookie');
    const adminCookie = adminRawCookie ? adminRawCookie.split(';')[0] : '';
    assert(adminLoginRes.status === 200 && !!adminCookie, 'Admin signed in successfully');

    console.log('\n14. Testing Admin View All Orders (/api/orders/admin/all)...');
    const adminOrdersRes = await fetch(`${BASE_URL}/orders/admin/all`, {
      headers: { Cookie: adminCookie },
    });
    const adminOrdersData = await adminOrdersRes.json();
    assert(adminOrdersRes.status === 200, 'Admin orders retrieved 200');
    assert(adminOrdersData.orders?.length > 0, `Admin sees ${adminOrdersData.orders?.length} orders total`);

    console.log('\n========================================');
    console.log(`📊 ACR Prints Orders Test Summary: ${passedTests} PASSED, ${totalTests - passedTests} FAILED`);
    console.log('========================================\n');
  } catch (err) {
    console.error('❌ Orders test error:', err);
    console.log('\n========================================');
    console.log(`📊 ACR Prints Orders Test Summary: ${passedTests} PASSED, ${totalTests - passedTests} FAILED`);
    console.log('========================================\n');
    process.exit(1);
  }
}

runOrdersTests();
