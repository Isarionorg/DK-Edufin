import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_URL}`, // ✅ add /api/v1
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor - uncomment the token logic
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token'); // ✅ uncomment this
    if (token) {
      config.headers.Authorization = `Bearer ${token}`; // ✅ and this
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default axiosInstance;

