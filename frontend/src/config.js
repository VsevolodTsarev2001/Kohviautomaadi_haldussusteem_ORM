// API Configuration
export const API_BASE_URL = 'http://localhost:5190/api';

// Helper function to get headers with auth token
export const getAuthHeaders = () => {
  // Пробуем получить токен из двух мест для совместимости
  const token = localStorage.getItem('token') || JSON.parse(localStorage.getItem('user') || '{}').token;
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};
