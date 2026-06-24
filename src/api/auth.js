import api from './axios';

export const register = async ({ name, email, password, role = 'student', courseId }) => {
  const { data } = await api.post('/api/auth/register', { name, email, password, role, courseId: Number(courseId) });
  return data;
};

export const login = async ({ email, password }) => {
  const { data } = await api.post('/api/auth/login', { email, password });
  return data;
};

export const logout = async () => {
  const { data } = await api.post('/api/auth/logout');
  return data;
};

export const refresh = async () => {
  const { data } = await api.post('/api/auth/refresh');
  return data;
};

export const getMe = async () => {
  const { data } = await api.get('/api/get-users/me');
  return data;
};
