// API URLs
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://waytopg.onrender.com/api';
export const API_URL_NO_SUFFIX = import.meta.env.VITE_API_URL?.replace('/api', '') || 'https://waytopg.onrender.com';

// Routes
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  SIGNUP: '/signup',
  ADMIN_LOGIN: '/admin-login',
  OWNER_LOGIN: '/owner-login',
  ADMIN_DASHBOARD: '/admin-dashboard',
  OWNER_DASHBOARD: '/owner-dashboard',
  STUDENT_DASHBOARD: '/student-dashboard',
  ACCOMMODATIONS: '/accommodations',
  ACCOMMODATION_DETAIL: '/accommodation/:id',
  ADD_ACCOMMODATION: '/add-accommodation',
  EDIT_ACCOMMODATION: '/edit-accommodation/:id',
  ABOUT: '/about',
} as const;

// User Roles
export const USER_ROLES = {
  ADMIN: 'admin',
  OWNER: 'owner',
  STUDENT: 'student',
} as const;

// Local Storage Keys
export const STORAGE_KEYS = {
  TOKEN: 'token',
  USER_ROLE: 'userRole',
  USER_DATA: 'userData',
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  INVALID_CREDENTIALS: 'Invalid phone number or password',
  SERVER_ERROR: 'Something went wrong. Please try again later.',
  UNAUTHORIZED: 'You are not authorized to access this resource',
  NETWORK_ERROR: 'Network error. Please check your internet connection',
} as const;

