interface ValidationResult {
  isValid: boolean;
  message?: string;
}

// Validate email format
export const validateEmail = (email: string): ValidationResult => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) {
    return { isValid: false, message: 'Email is required' };
  }
  return {
    isValid: re.test(email),
    message: re.test(email) ? undefined : 'Please enter a valid email address',
  };
};

// Validate password strength
export const validatePassword = (password: string): ValidationResult => {
  if (!password) {
    return { isValid: false, message: 'Password is required' };
  }
  
  if (password.length < 8) {
    return {
      isValid: false,
      message: 'Password must be at least 8 characters long',
    };
  }
  
  if (!/[A-Z]/.test(password)) {
    return {
      isValid: false,
      message: 'Password must contain at least one uppercase letter',
    };
  }
  
  if (!/[a-z]/.test(password)) {
    return {
      isValid: false,
      message: 'Password must contain at least one lowercase letter',
    };
  }
  
  if (!/[0-9]/.test(password)) {
    return {
      isValid: false,
      message: 'Password must contain at least one number',
    };
  }
  
  return { isValid: true };
};

// Validate required field
export const validateRequired = (value: string, fieldName: string): ValidationResult => {
  if (!value || value.trim() === '') {
    return { isValid: false, message: `${fieldName} is required` };
  }
  return { isValid: true };
};

// Validate URL format
export const validateUrl = (url: string): ValidationResult => {
  try {
    new URL(url);
    return { isValid: true };
  } catch (e) {
    return { isValid: false, message: 'Please enter a valid URL' };
  }
};

// Validate phone number
export const validatePhone = (phone: string): ValidationResult => {
  const re = /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]*$/;
  if (!phone) {
    return { isValid: false, message: 'Phone number is required' };
  }
  return {
    isValid: re.test(phone),
    message: re.test(phone) ? undefined : 'Please enter a valid phone number',
  };
};

// Validate form fields
export const validateForm = (fields: Record<string, string>): { isValid: boolean; errors: Record<string, string> } => {
  const errors: Record<string, string> = {};
  let isValid = true;

  Object.entries(fields).forEach(([fieldName, value]) => {
    const requiredValidation = validateRequired(value, fieldName);
    if (!requiredValidation.isValid) {
      errors[fieldName] = requiredValidation.message || '';
      isValid = false;
      return;
    }

    // Add more specific validations based on field name
    switch (fieldName) {
      case 'email':
        const emailValidation = validateEmail(value);
        if (!emailValidation.isValid) {
          errors[fieldName] = emailValidation.message || '';
          isValid = false;
        }
        break;
      case 'password':
        const passwordValidation = validatePassword(value);
        if (!passwordValidation.isValid) {
          errors[fieldName] = passwordValidation.message || '';
          isValid = false;
        }
        break;
      case 'phone':
        const phoneValidation = validatePhone(value);
        if (!phoneValidation.isValid) {
          errors[fieldName] = phoneValidation.message || '';
          isValid = false;
        }
        break;
      case 'url':
        const urlValidation = validateUrl(value);
        if (!urlValidation.isValid) {
          errors[fieldName] = urlValidation.message || '';
          isValid = false;
        }
        break;
      default:
        break;
    }
  });

  return { isValid, errors };
};
