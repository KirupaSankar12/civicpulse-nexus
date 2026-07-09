// Public API — no Bearer token, used for registration endpoint
import axios from 'axios';

const publicApi = axios.create({
  baseURL: 'http://localhost:8082', // Direct to citizen-service (bypasses auth gateway)
});

export default publicApi;
