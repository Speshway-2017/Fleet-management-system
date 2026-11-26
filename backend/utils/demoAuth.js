export const DEMO_DRIVER_CREDENTIALS = Object.freeze({
  role: 'DRIVER',
  email: 'verification@gmail.com',
  mobile: '9876543210',
  otp: '123456',
  fullName: 'Verification Demo Driver',
  firstName: 'Verification',
  lastName: 'Driver',
  employeeId: 'EMP-VERIFY01',
  licenseNumber: 'DL-VERIFY-987654',
});

/**
 * Fixed demo OTP is strictly restricted to non-production environments
 * (development / test / explicit non-production demo mode).
 */
export const isDemoOtpAllowed = () => {
  const nodeEnv = String(process.env.NODE_ENV || 'development').trim().toLowerCase();
  if (nodeEnv === 'production') {
    return false;
  }
  return nodeEnv === 'development' || nodeEnv === 'test' || process.env.DEMO_MODE === 'true';
};

export const normalizeTenDigitMobile = (value) => {
  if (!value) return '';
  const digits = String(value).replace(/\D/g, '');
  if (digits.length === 10) return digits;
  if (digits.length > 10 && digits.length <= 13) return digits.slice(-10);
  return '';
};

export const isDemoDriverIdentifier = (identifier) => {
  if (!identifier) return false;
  const raw = String(identifier).trim().toLowerCase();
  if (raw === DEMO_DRIVER_CREDENTIALS.email) {
    return true;
  }
  const tenDigits = normalizeTenDigitMobile(raw);
  return tenDigits === DEMO_DRIVER_CREDENTIALS.mobile;
};

export const isDemoDriverAccount = (account) => {
  if (!account) return false;
  const emailMatch = String(account.email || '').trim().toLowerCase() === DEMO_DRIVER_CREDENTIALS.email;
  const phoneMatch = [account.phone, account.phoneNumber, account.mobile].some(
    (num) => normalizeTenDigitMobile(num) === DEMO_DRIVER_CREDENTIALS.mobile
  );
  return emailMatch || phoneMatch;
};

export const isValidDemoOtp = (identifier, account, otp) => {
  if (!isDemoOtpAllowed()) return false;
  if (!isDemoDriverIdentifier(identifier)) return false;
  if (!isDemoDriverAccount(account)) return false;
  return String(otp || '').trim() === DEMO_DRIVER_CREDENTIALS.otp;
};

