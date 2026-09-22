/**
 * Automated end-to-end integration test for Phase 1 Authentication Flow
 */
const BASE_URL = 'http://localhost:5000/api/auth';

async function runTests() {
  console.log('🧪 Starting Phase 1 Authentication Flow Tests...\n');
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

  const testMobile = `91${Math.floor(10000000 + Math.random() * 90000000)}`;
  const testEmail = `test_${Date.now()}@example.com`;
  let activeOtp = null;
  let authCookie = null;

  try {
    // 1. Send Registration OTP
    console.log(`1. Testing Registration Step 1: Send OTP for mobile ${testMobile}...`);
    const sendRes = await fetch(`${BASE_URL}/register/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Arun Kumar',
        mobile: testMobile,
        email: testEmail,
      }),
    });
    const sendData = await sendRes.json();
    assert(sendRes.status === 200, `Send OTP status 200 (received ${sendRes.status})`);
    assert(!!sendData.devOtp, `Received dev OTP: ${sendData.devOtp}`);
    activeOtp = sendData.devOtp;

    // 2. Test Duplicate Check
    console.log('\n2. Testing Duplicate Mobile Detection...');
    const dupRes = await fetch(`${BASE_URL}/register/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Another Person',
        mobile: '9876501234', // Demo customer already seeded
        email: 'random@example.com',
      }),
    });
    assert(dupRes.status === 409, `Duplicate mobile rejected with 409 (received ${dupRes.status})`);

    // 3. Test Invalid OTP
    console.log('\n3. Testing Registration Step 2: Invalid OTP Attempt...');
    const invalidOtpRes = await fetch(`${BASE_URL}/register/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mobile: testMobile,
        otp: '000000',
        purpose: 'REGISTER',
      }),
    });
    assert(invalidOtpRes.status === 400, `Invalid OTP rejected with 400 (received ${invalidOtpRes.status})`);

    // 4. Test Valid OTP Verification
    console.log('\n4. Testing Registration Step 2: Valid OTP Verification...');
    const verifyRes = await fetch(`${BASE_URL}/register/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mobile: testMobile,
        otp: activeOtp,
        purpose: 'REGISTER',
      }),
    });
    const verifyData = await verifyRes.json();
    assert(verifyRes.status === 200 && verifyData.success, 'Valid OTP verified successfully');

    // 5. Test Weak Password Rejection
    console.log('\n5. Testing Registration Step 3: Password Strength Validation...');
    const weakPassRes = await fetch(`${BASE_URL}/register/complete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Arun Kumar',
        mobile: testMobile,
        email: testEmail,
        password: 'weak',
        confirmPassword: 'weak',
      }),
    });
    assert(weakPassRes.status === 400, `Weak password rejected with 400 (received ${weakPassRes.status})`);

    // 6. Complete Registration with Strong Password
    console.log('\n6. Testing Registration Step 3: Complete Account Creation...');
    const completeRes = await fetch(`${BASE_URL}/register/complete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Arun Kumar',
        mobile: testMobile,
        email: testEmail,
        password: 'Password@123',
        confirmPassword: 'Password@123',
      }),
    });
    const completeData = await completeRes.json();
    const rawSetCookie = completeRes.headers.get('set-cookie');
    authCookie = rawSetCookie ? rawSetCookie.split(';')[0] : null;
    assert(completeRes.status === 201, `Account created with 201 (received ${completeRes.status})`);
    assert(completeData.user?.mobile === testMobile, `User object returned with mobile: ${completeData.user?.mobile}`);
    assert(!!authCookie, `httpOnly cookie set: ${authCookie ? 'Yes' : 'No'}`);

    // 7. Verify /api/auth/me Profile Route
    console.log('\n7. Testing Authenticated /api/auth/me Endpoint...');
    const meRes = await fetch(`${BASE_URL}/me`, {
      headers: { Cookie: authCookie || '' },
    });
    const meData = await meRes.json();
    assert(meRes.status === 200 && meData.user?.name === 'Arun Kumar', `Profile retrieved: ${meData.user?.name}`);

    // 8. Test Logout
    console.log('\n8. Testing Logout...');
    const logoutRes = await fetch(`${BASE_URL}/logout`, {
      method: 'POST',
      headers: { Cookie: authCookie || '' },
    });
    assert(logoutRes.status === 200, 'Logout succeeded');

    // 9. Test Login with New Account
    console.log('\n9. Testing Sign In with Newly Created Account...');
    const loginRes = await fetch(`${BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mobile: testMobile,
        password: 'Password@123',
      }),
    });
    const loginData = await loginRes.json();
    assert(loginRes.status === 200 && loginData.user?.mobile === testMobile, 'Login successful');

    // 10. Test Login with Wrong Password
    console.log('\n10. Testing Sign In with Wrong Password...');
    const wrongLoginRes = await fetch(`${BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mobile: testMobile,
        password: 'WrongPassword@999',
      }),
    });
    assert(wrongLoginRes.status === 401, `Wrong password rejected with 401 (received ${wrongLoginRes.status})`);

    // 11. Test Forgot Password Flow
    console.log('\n11. Testing Forgot Password Flow...');
    const forgotOtpRes = await fetch(`${BASE_URL}/forgot-password/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mobile: testMobile }),
    });
    const forgotOtpData = await forgotOtpRes.json();
    assert(forgotOtpRes.status === 200 && !!forgotOtpData.devOtp, `Forgot OTP generated: ${forgotOtpData.devOtp}`);

    const verifyForgotRes = await fetch(`${BASE_URL}/forgot-password/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mobile: testMobile,
        otp: forgotOtpData.devOtp,
        purpose: 'FORGOT_PASSWORD',
      }),
    });
    assert(verifyForgotRes.status === 200, 'Forgot OTP verified successfully');

    const resetRes = await fetch(`${BASE_URL}/forgot-password/reset`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mobile: testMobile,
        newPassword: 'NewPassword@456',
        confirmPassword: 'NewPassword@456',
      }),
    });
    assert(resetRes.status === 200, 'Password reset succeeded');

    // 12. Test Login with Reset Password
    console.log('\n12. Testing Login with Newly Reset Password...');
    const newLoginRes = await fetch(`${BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mobile: testMobile,
        password: 'NewPassword@456',
      }),
    });
    assert(newLoginRes.status === 200, 'Sign in with new password succeeded!');

  } catch (err) {
    console.error('❌ Test execution error:', err);
    failed++;
  }

  console.log('\n========================================');
  console.log(`📊 Test Summary: ${passed} PASSED, ${failed} FAILED`);
  console.log('========================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
