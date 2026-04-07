// Secure token storage utilities
// Using localStorage for now, but can be upgraded to httpOnly cookies

export const setAuthToken = (token) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('chatToken', token);
  }
};

export const getAuthToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('chatToken');
  }
  return null;
};

export const removeAuthToken = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('chatToken');
  }
};

export const setUserData = (user) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('chatUser', JSON.stringify(user));
  }
};

export const getUserData = () => {
  if (typeof window !== 'undefined') {
    const userData = localStorage.getItem('chatUser');
    return userData ? JSON.parse(userData) : null;
  }
  return null;
};

export const removeUserData = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('chatUser');
  }
};

// For production, consider using httpOnly cookies with secure flag
// This would require backend changes to set cookies properly
