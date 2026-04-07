// Form validation utilities

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password) => {
  // At least 6 characters, 1 letter, 1 number
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{6,}$/;
  return passwordRegex.test(password);
};

export const validateName = (name) => {
  // Name should be 2-50 characters, letters only (with spaces)
  const nameRegex = /^[a-zA-Z\s]{2,50}$/;
  return nameRegex.test(name.trim());
};

export const validateMessage = (message) => {
  // Message should be 1-1000 characters
  return message.trim().length >= 1 && message.trim().length <= 1000;
};

export const getValidationErrors = (field, value) => {
  const errors = [];
  
  switch (field) {
    case 'email':
      if (!value) errors.push('Email is required');
      else if (!validateEmail(value)) errors.push('Please enter a valid email address');
      break;
      
    case 'password':
      if (!value) errors.push('Password is required');
      else if (value.length < 6) errors.push('Password must be at least 6 characters');
      else if (!validatePassword(value)) errors.push('Password must contain at least 1 letter and 1 number');
      break;
      
    case 'name':
      if (!value) errors.push('Name is required');
      else if (!validateName(value)) errors.push('Name must be 2-50 characters and contain only letters');
      break;
      
    case 'message':
      if (!value) errors.push('Message cannot be empty');
      else if (!validateMessage(value)) errors.push('Message must be 1-1000 characters');
      break;
      
    default:
      break;
  }
  
  return errors;
};

export const sanitizeInput = (input) => {
  return input.trim().replace(/[<>]/g, '');
};
