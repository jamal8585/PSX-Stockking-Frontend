
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const API = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000
});

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
