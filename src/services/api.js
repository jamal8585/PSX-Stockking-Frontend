
import axios from 'axios';

const getBaseUrl = () => {
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;
  if (typeof window !== 'undefined' && (window.location.hostname.includes('vercel.app') || window.location.hostname !== 'localhost')) {
    return 'https://psx-stockking-backend.vercel.app/api';
  }
  return '/api';
};

const API_BASE_URL = getBaseUrl();

const API = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000
});

// Auto-attach JWT token to all requests
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('psx_auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

// Token helpers
export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('psx_auth_token', token);
  } else {
    localStorage.removeItem('psx_auth_token');
  }
};

export const getAuthToken = () => localStorage.getItem('psx_auth_token');

export const removeAuthToken = () => {
  localStorage.removeItem('psx_auth_token');
  localStorage.removeItem('psx_user_profile');
};

// ==========================================
// AUTH ENDPOINTS
// ==========================================
export const signupUser = async (data) => {
  const res = await API.post('/auth/signup', data);
  if (res.data?.token) setAuthToken(res.data.token);
  return res.data;
};

export const loginUser = async (data) => {
  const res = await API.post('/auth/login', data);
  if (res.data?.token) setAuthToken(res.data.token);
  return res.data;
};

export const socialAuthLogin = async (socialData) => {
  const res = await API.post('/auth/social-login', socialData);
  if (res.data?.token) setAuthToken(res.data.token);
  return res.data;
};

export const getCurrentUser = async () => {
  const res = await API.get('/auth/me');
  return res.data;
};

export const submitUpgradeProof = async (data) => {
  const res = await API.post('/auth/upgrade-request', data);
  return res.data;
};

export const updateUserProfile = async (profileData) => {
  const res = await API.put('/auth/profile', profileData);
  return res.data;
};

// ==========================================
// ADMIN ENDPOINTS
// ==========================================
export const getAdminUsers = async (params = {}) => {
  const res = await API.get('/admin/users', { params });
  return res.data;
};

export const syncAdminUsers = async (clientUsers = []) => {
  const res = await API.post('/admin/sync-users', { clientUsers });
  return res.data;
};

export const createAdminUser = async (userData) => {
  const res = await API.post('/admin/create-user', userData);
  return res.data;
};

export const updateAdminSubscription = async (userId, data) => {
  const targetId = typeof userId === 'object' ? (userId.id || userId._id || userId.email) : userId;
  const res = await API.post(`/admin/users/${encodeURIComponent(String(targetId || '').trim())}/subscription`, data);
  return res.data;
};

export const deleteAdminUser = async (userId) => {
  const targetId = typeof userId === 'object' ? (userId.id || userId._id || userId.email) : userId;
  const res = await API.delete(`/admin/users/${encodeURIComponent(String(targetId || '').trim())}`);
  return res.data;
};

export const getAdminAnalytics = async () => {
  const res = await API.get('/admin/analytics');
  return res.data;
};

// ==========================================
// MARKET & STOCKS ENDPOINTS
// ==========================================
export const getMarketSummary = async () => {
  const res = await API.get('/market/summary');
  return res.data;
};

export const getStocks = async (params = {}) => {
  const res = await API.get('/stocks', { params });
  return res.data;
};

export const getStockDetail = async (symbol) => {
  const res = await API.get('/stocks/' + symbol);
  return res.data;
};

export const getRecommendations = async (params = {}) => {
  const res = await API.get('/recommendations', { params });
  return res.data;
};

export const getNews = async (params = {}) => {
  const res = await API.get('/news', { params });
  return res.data;
};

export const runMarketScan = async () => {
  const res = await API.post('/scan');
  return res.data;
};

export const getWatchlist = async () => {
  const res = await API.get('/watchlist');
  return res.data;
};

export const toggleWatchlist = async (symbol) => {
  const res = await API.post('/watchlist/toggle', { symbol });
  return res.data;
};

// Portfolio Endpoints
export const getPortfolio = async () => {
  const res = await API.get('/portfolio');
  return res.data;
};

export const addPortfolioPosition = async (data) => {
  const res = await API.post('/portfolio', data);
  return res.data;
};

export const updatePortfolioPosition = async (id, data) => {
  const res = await API.put('/portfolio/' + id, data);
  return res.data;
};

export const deletePortfolioPosition = async (id) => {
  const res = await API.delete('/portfolio/' + id);
  return res.data;
};
