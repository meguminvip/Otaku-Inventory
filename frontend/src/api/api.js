import axios from 'axios';

/**
 * Authors: h_ypi and A.R.O.N.A
 */

const baseURL = import.meta.env.VITE_API_BASE_URL || '/api';

const api = axios.create({
  baseURL,
  timeout: 15000
});

export default api;
