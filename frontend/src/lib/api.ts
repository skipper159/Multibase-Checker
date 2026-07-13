import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.response.use(
  (response) => {
    if (response.data && response.data.success === false) {
      console.warn(`⚠️ Test Suite API warning [${response.config.method?.toUpperCase()}] ${response.config.url}:`, response.data);
    }
    return response;
  },
  (error) => {
    console.error(`❌ Test Suite Network Error [${error.config?.method?.toUpperCase()}] ${error.config?.url}:`, error.response?.data || error.message || error);
    return Promise.reject(error);
  }
);

export default api;
