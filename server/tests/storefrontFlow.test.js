/**
 * Automated end-to-end integration test for ACR Prints Storefront & Catalog Flow
 */
const BASE_URL = 'http://localhost:5000/api';

async function runStorefrontTests() {
  console.log('🧪 Starting ACR Prints Storefront Flow Tests...\n');
  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      failed++;
    }
  }

  try {
    // 1. Test Categories
    console.log('1. Testing Categories Endpoint (/api/categories)...');
    const catRes = await fetch(`${BASE_URL}/categories`);
    const catData = await catRes.json();
    assert(catRes.status === 200, 'Categories returned status 200');
    assert(catData.categories?.length >= 4, `Found ${catData.categories?.length} categories`);

    // 2. Test Product Catalog
    console.log('\n2. Testing Product Catalog (/api/products)...');
    const prodRes = await fetch(`${BASE_URL}/products`);
    const prodData = await prodRes.json();
    assert(prodRes.status === 200, 'Products returned status 200');
    assert(prodData.products?.length >= 10, `Retrieved ${prodData.products?.length} products`);
    assert(Array.isArray(prodData.products[0].images), 'Product images parsed as array');
    assert(prodData.products[0].images[0].startsWith('/images/products/'), 'Images point to real uploaded photos');

    // 3. Test Category Filter
    console.log('\n3. Testing Category Filter (?category=pillowcases-shams)...');
    const pillowRes = await fetch(`${BASE_URL}/products?category=pillowcases-shams`);
    const pillowData = await pillowRes.json();
    const allPillows = pillowData.products.every((p) => p.category?.slug === 'pillowcases-shams');
    assert(pillowRes.status === 200 && allPillows && pillowData.products.length > 0, `Pillowcase category filter matched ${pillowData.products.length} products`);

    // 4. Test Search Filter
    console.log('\n4. Testing Full-text Search Filter (?search=Velvet)...');
    const searchRes = await fetch(`${BASE_URL}/products?search=Velvet`);
    const searchData = await searchRes.json();
    assert(searchRes.status === 200 && searchData.products.length > 0, `Search found ${searchData.products.length} matching items`);

    // 5. Test Live Search Suggestions
    console.log('\n5. Testing Live Search Suggestions (/api/products/suggestions?q=pillow)...');
    const suggRes = await fetch(`${BASE_URL}/products/suggestions?q=pillow`);
    const suggData = await suggRes.json();
    assert(suggRes.status === 200 && suggData.suggestions.length > 0, `Returned ${suggData.suggestions.length} suggestions`);

    // 6. Test Single Product Details by Slug
    console.log('\n6. Testing Product Details (/api/products/textured-queen-pillowcase)...');
    const detailRes = await fetch(`${BASE_URL}/products/textured-queen-pillowcase`);
    const detailData = await detailRes.json();
    assert(detailRes.status === 200, 'Product details returned 200');
    assert(detailData.product?.title.includes('Textured Queen Pillowcase'), 'Correct product title returned');
    assert(detailData.related?.length > 0, `Found ${detailData.related?.length} related products`);

    // 7. Login for Protected Cart & Profile Tests
    console.log('\n7. Authenticating Demo User for Cart & Profile Operations...');
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mobile: '9876501234',
        password: 'Customer@12345',
      }),
    });
    const rawSetCookie = loginRes.headers.get('set-cookie');
    const authCookie = rawSetCookie ? rawSetCookie.split(';')[0] : '';
    assert(loginRes.status === 200 && !!authCookie, 'Demo customer signed in, auth cookie received');

    // 8. Test Add to Cart
    console.log('\n8. Testing Add Item to Cart (/api/cart)...');
    const testProductId = detailData.product.id;
    const addCartRes = await fetch(`${BASE_URL}/cart`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: authCookie,
      },
      body: JSON.stringify({
        productId: testProductId,
        quantity: 2,
        size: 'Queen (20x30 in)',
      }),
    });
    const addCartData = await addCartRes.json();
    assert(addCartRes.status === 200 && addCartData.success, 'Item added to bag');

    // 9. Test View Cart
    console.log('\n9. Testing Fetch User Cart (/api/cart)...');
    const viewCartRes = await fetch(`${BASE_URL}/cart`, {
      headers: { Cookie: authCookie },
    });
    const viewCartData = await viewCartRes.json();
    assert(viewCartRes.status === 200, 'Cart retrieved successfully');
    assert(viewCartData.summary?.itemCount >= 2, `Cart item count: ${viewCartData.summary?.itemCount}`);
    assert(viewCartData.summary?.subtotal > 0, `Cart subtotal: ₹${viewCartData.summary?.subtotal}`);
    const cartItemId = viewCartData.items[0]?.id;

    // 10. Test Update Cart Quantity
    console.log('\n10. Testing Update Cart Item Quantity (/api/cart/:id)...');
    const updateCartRes = await fetch(`${BASE_URL}/cart/${cartItemId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Cookie: authCookie,
      },
      body: JSON.stringify({ quantity: 4 }),
    });
    const updateCartData = await updateCartRes.json();
    assert(updateCartRes.status === 200 && updateCartData.item?.quantity === 4, 'Quantity updated to 4');

    // 11. Test User Profile & Saved Addresses
    console.log('\n11. Testing User Profile & Address APIs (/api/user)...');
    const profileRes = await fetch(`${BASE_URL}/user/profile`, {
      headers: { Cookie: authCookie },
    });
    const profileData = await profileRes.json();
    assert(profileRes.status === 200 && profileData.user?.name === 'Priya Sharma', 'User profile retrieved');

    // 12. Test Shop Details
    console.log('\n12. Testing Shop Info Endpoint (/api/shop/info)...');
    const shopRes = await fetch(`${BASE_URL}/shop/info`);
    const shopData = await shopRes.json();
    assert(shopRes.status === 200 && shopData.shop?.shopName === 'ACR Prints', 'Shop name is ACR Prints');
    assert(shopData.shop?.phone === '+91 87788 24123', 'Phone matches +91 87788 24123');
    assert(shopData.shop?.address?.city === 'Erode', 'Address city matches Erode');

  } catch (err) {
    console.error('❌ Storefront test error:', err);
    failed++;
  }

  console.log('\n========================================');
  console.log(`📊 ACR Prints Test Summary: ${passed} PASSED, ${failed} FAILED`);
  console.log('========================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runStorefrontTests();
