import assert from 'node:assert';
import app from '../src/server.js';
import prisma from '../src/config/prisma.js';

// We will test using direct HTTP requests against the running Express app instance or fetch
const PORT = 5055;

async function runTests() {
  const server = app.listen(PORT);
  console.log(`\n🧪 Testing ACR Cottons Comprehensive Flow on port ${PORT}...`);

  const baseUrl = `http://127.0.0.1:${PORT}/api`;

  try {
    // 1. Shop Info test
    console.log('1. Testing Shop Details & Location info...');
    const shopRes = await fetch(`${baseUrl}/shop/info`);
    const shopData = await shopRes.json();
    assert.strictEqual(shopData.success, true);
    assert.strictEqual(shopData.shop.shopName, 'ACR COTTONS');
    assert.strictEqual(shopData.shop.founder, 'A.C. RAJ KUMAR');
    assert.ok(shopData.shop.mapUrl.includes('48x6D8xnWNCibc9YA'));
    console.log('   ✅ Shop info returns ACR COTTONS & A.C. Raj Kumar');

    // 2. Universal Order Tracking test (Seeded Bedding Order)
    console.log('2. Testing Universal Order Tracking for regular bedding order (ACR-TRK-891024)...');
    const trkRes = await fetch(`${baseUrl}/orders/track/ACR-TRK-891024`);
    const trkData = await trkRes.json();
    assert.strictEqual(trkData.success, true);
    assert.strictEqual(trkData.type, 'REGULAR_ORDER');
    assert.strictEqual(trkData.order.trackingNumber, 'ACR-TRK-891024');
    assert.ok(trkData.order.trackingUpdates.length >= 4);
    console.log(`   ✅ Bedding order tracking loaded with ${trkData.order.trackingUpdates.length} timeline stages`);

    // 3. Universal Tracking test (Seeded Custom T-Shirt Order)
    console.log('3. Testing Universal Order Tracking for Custom T-Shirt (ACR-TRK-TSHIRT-5521)...');
    const custTrkRes = await fetch(`${baseUrl}/orders/track/ACR-TRK-TSHIRT-5521`);
    const custTrkData = await custTrkRes.json();
    assert.strictEqual(custTrkData.success, true);
    assert.strictEqual(custTrkData.type, 'CUSTOM_TSHIRT');
    assert.strictEqual(custTrkData.order.trackingNumber, 'ACR-TRK-TSHIRT-5521');
    assert.strictEqual(custTrkData.order.totalQuantity, 15);
    console.log('   ✅ Custom T-Shirt tracking loaded with MOQ 15 units verified');

    // 4. Realtime OTP Login for First-Time / Fast Login
    console.log('4. Testing Realtime OTP generation on Login (/auth/login/send-otp)...');
    const otpSendRes = await fetch(`${baseUrl}/auth/login/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mobile: '9876501234' }),
    });
    const otpSendData = await otpSendRes.json();
    assert.strictEqual(otpSendData.success, true);
    assert.ok(otpSendData.devOtp, 'Dev OTP must be generated in realtime');
    console.log(`   ✅ Realtime OTP generated: ${otpSendData.devOtp}`);

    // Verify Realtime Login OTP
    console.log('5. Testing Realtime OTP verification (/auth/login/verify-otp)...');
    const otpVerifyRes = await fetch(`${baseUrl}/auth/login/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mobile: '9876501234', otp: otpSendData.devOtp }),
    });
    const otpVerifyData = await otpVerifyRes.json();
    assert.strictEqual(otpVerifyData.success, true);
    assert.strictEqual(otpVerifyData.user.name, 'Priya Sharma');
    const authCookie = otpVerifyRes.headers.get('set-cookie');
    assert.ok(authCookie, 'Auth cookie must be set');
    console.log('   ✅ Realtime OTP verified and user authenticated successfully');

    // 6. Custom T-Shirt Order MOQ Validation (< 10 units must fail)
    console.log('6. Testing Custom T-Shirt MOQ enforcement (submitting 5 units)...');
    const moqFailRes = await fetch(`${baseUrl}/custom-tshirt/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: authCookie,
      },
      body: JSON.stringify({
        tshirtColor: 'Pure White',
        fabricGsm: '180 GSM Bio-Washed Combed Cotton',
        printPosition: 'Front Chest',
        designPreviewUrl: '/images/products/pillow_cover_1.jpeg',
        totalQuantity: 5, // Invalid, below minimum 10
        shippingAddress: {
          fullName: 'Priya Sharma',
          mobile: '9876501234',
          street: 'Perundurai Road',
          city: 'Erode',
          state: 'Tamil Nadu',
          pincode: '638011',
        },
      }),
    });
    const moqFailData = await moqFailRes.json();
    assert.strictEqual(moqFailRes.status, 400);
    assert.strictEqual(moqFailData.success, false);
    assert.ok(moqFailData.message.includes('Minimum order quantity for customized t-shirt printing is 10 units'));
    console.log('   ✅ Submitting < 10 custom t-shirts correctly rejected by database validation');

    // 7. Custom T-Shirt Order Valid MOQ (>= 10 units must succeed)
    console.log('7. Testing Custom T-Shirt Order with valid MOQ (submitting 12 units)...');
    const validOrderRes = await fetch(`${baseUrl}/custom-tshirt/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: authCookie,
      },
      body: JSON.stringify({
        tshirtColor: 'Royal Charcoal',
        fabricGsm: '180 GSM Bio-Washed Combed Cotton',
        printPosition: 'Front Chest',
        designPreviewUrl: '/images/products/pillow_cover_5.jpeg',
        customText: 'ACR COTTONS - ERODE',
        totalQuantity: 12, // Valid: >= 10
        sizeBreakdown: { S: 2, M: 4, L: 4, XL: 2 },
        shippingAddress: {
          fullName: 'Priya Sharma',
          mobile: '9876501234',
          street: 'Perundurai Road',
          city: 'Erode',
          state: 'Tamil Nadu',
          pincode: '638011',
        },
      }),
    });
    const validOrderData = await validOrderRes.json();
    assert.strictEqual(validOrderRes.status, 201);
    assert.strictEqual(validOrderData.success, true);
    assert.ok(validOrderData.trackingNumber, 'Tracking number must be provided');
    assert.strictEqual(validOrderData.order.totalQuantity, 12);
    console.log(`   ✅ Custom order created with 12 units and Tracking ID: ${validOrderData.trackingNumber}`);

    // 8. Track the newly created custom order
    console.log(`8. Tracking newly created custom order (${validOrderData.trackingNumber})...`);
    const newTrkRes = await fetch(`${baseUrl}/orders/track/${validOrderData.trackingNumber}`);
    const newTrkData = await newTrkRes.json();
    assert.strictEqual(newTrkData.success, true);
    assert.strictEqual(newTrkData.order.totalQuantity, 12);
    console.log('   ✅ New custom order immediately trackable with live milestones');

    console.log('\n======================================================');
    console.log('🎉 ALL ACR COTTONS COMPREHENSIVE FLOW TESTS PASSED! 🎉');
    console.log('======================================================\n');
  } finally {
    server.close();
    await prisma.$disconnect();
  }
}

runTests().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
