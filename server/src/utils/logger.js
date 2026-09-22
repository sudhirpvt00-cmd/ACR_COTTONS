export const logger = {
  info: (msg, ...args) => console.log(`[INFO] ${new Date().toLocaleTimeString()} - ${msg}`, ...args),
  warn: (msg, ...args) => console.warn(`[WARN] ${new Date().toLocaleTimeString()} - ${msg}`, ...args),
  error: (msg, ...args) => console.error(`[ERROR] ${new Date().toLocaleTimeString()} - ${msg}`, ...args),
  otpBanner: ({ mobile, otp, purpose }) => {
    console.log('\n' + '='.repeat(54));
    console.log(`🔑 [DEV MODE] OTP Generated for ${mobile}`);
    console.log(`   Purpose : ${purpose}`);
    console.log(`   OTP CODE: >>> ${otp} <<<`);
    console.log(`   Valid for 5 minutes. DO NOT SHARE`);
    console.log('='.repeat(54) + '\n');
  }
};
