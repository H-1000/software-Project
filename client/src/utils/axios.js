import axios from 'axios';

const instance = axios.create({
  baseURL: 'http://localhost:5000/api/v1',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  },
  credentials: 'include',
  timeout: 5000 // 5 second timeout
});

// List of public routes that don't require authentication
const publicRoutes = [
  '/events',          // Get all events
  /^\/events\/[^/]+$/, // Get event by ID (using regex to match /events/{id})
  '/forgetPassword',   // Password change
  '/'                 // Home page
];

// Add request interceptor for logging
instance.interceptors.request.use(
  (config) => {
    console.log('Making request to:', config.url, {
      method: config.method,
      data: config.data
    });
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor to handle errors
instance.interceptors.response.use(
  (response) => {
    console.log('Response received:', {
      url: response.config.url,
      status: response.status,
      data: response.data
    });
    return response;
  },
  (error) => {
    console.error('Response error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });

    if (error.response?.status === 401) {
      const requestUrl = error.config.url;
      
      // Check if the URL matches any public route
      const isPublicRoute = publicRoutes.some(route => {
        if (route instanceof RegExp) {
          return route.test(requestUrl);
        }
        return requestUrl.includes(route);
      });

      // Only redirect to login if it's not a public route
      if (!isPublicRoute) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default instance; 