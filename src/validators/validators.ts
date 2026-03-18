export const validateUsername = (username: string): string => {
  if (!username) return 'Username is required.';
  return '';
};

export const validateEmail = (email: string): string => {
  if (!email) return 'Email is required.';
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return 'Please enter a valid email address.';
  return '';
};

export const validatePassword = (password: string): string => {
  if (!password) return 'Password is required.';
  if (password.length < 6) return 'Password must be at least 6 characters long.';
  return '';
};

export const validateConfirmPassword = (password: string, confirmPassword: string): string => {
  if (!confirmPassword) return 'Please confirm your password.';
  if (password !== confirmPassword) return 'Passwords do not match.';
  return '';
};