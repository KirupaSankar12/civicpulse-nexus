import axios from 'axios';
import keycloak from './keycloak.js';

// Authenticated API — sends Bearer token with every request
const api = axios.create({
  baseURL: 'http://localhost:8080',
});

api.interceptors.request.use(async (config) => {
  if (keycloak.isTokenExpired?.(30)) {
    try { await keycloak.updateToken(30); } catch (e) { keycloak.login(); }
  }
  if (keycloak.token) {
    config.headers.Authorization = `Bearer ${keycloak.token}`;
  }
  return config;
});

export default api;
