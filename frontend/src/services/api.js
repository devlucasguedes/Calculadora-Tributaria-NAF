import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000',
});

const publicAuthRoutes = new Set(['/auth/login', '/auth/register']);

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token && !publicAuthRoutes.has(config.url)) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const token = localStorage.getItem('token');
    const requestToken = error.config?.headers?.Authorization;

    // Uma resposta atrasada de outra sessão não deve apagar um login mais recente.
    if (
      error.response?.status === 401 &&
      !publicAuthRoutes.has(error.config?.url) &&
      token &&
      requestToken === `Bearer ${token}`
    ) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.replace('/login?session=expired');
    }

    return Promise.reject(error);
  },
);

export default api;
