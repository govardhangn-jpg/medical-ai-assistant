import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'https://medical-ai-assistant-1-we5t.onrender.com/api/';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data),
};

// Case APIs
export const caseAPI = {
  analyzeCase: (caseData) => api.post('/cases/analyze', caseData),
  getCases: (params) => api.get('/cases', { params }),
  getCaseById: (id) => api.get(`/cases/${id}`),
  updateCase: (id, data) => api.put(`/cases/${id}`, data),
  deleteCase: (id) => api.delete(`/cases/${id}`),
  getPatientCases: (patientId) => api.get(`/cases/patient/${patientId}`),
};

export default api;
