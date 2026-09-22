export const validators = {
  isValidMobile(mobile) {
    return /^[6-9]\d{9}$/.test(mobile?.trim() || '');
  },

  isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email?.trim() || '');
  },

  checkPasswordStrength(password) {
    if (!password) {
      return { score: 0, label: 'Empty', color: 'bg-gray-200', criteria: {} };
    }

    const criteria = {
      length: password.length >= 8,
      hasUpper: /[A-Z]/.test(password),
      hasLower: /[a-z]/.test(password),
      hasNumber: /\d/.test(password),
      hasSpecial: /[@$!%*?&#^~_-]/.test(password),
    };

    const passedCount = Object.values(criteria).filter(Boolean).length;

    let score = 0;
    let label = 'Weak';
    let color = 'bg-red-500';

    if (passedCount <= 2) {
      score = 25;
      label = 'Weak';
      color = 'bg-red-500';
    } else if (passedCount <= 4) {
      score = 65;
      label = 'Medium';
      color = 'bg-amber-500';
    } else {
      score = 100;
      label = 'Strong';
      color = 'bg-emerald-600';
    }

    return { score, label, color, criteria };
  },
};
