import api from './api';

export const songService = {
  list: (q) => api.get('/songs', { params: q ? { q } : {} }),
  getById: (id) => api.get(`/songs/${id}`),
  create: (data) => api.post('/songs', data),
  bulkCreate: (data) => api.post('/songs/bulk', data),
  update: (id, data) => api.put(`/songs/${id}`, data),
  delete: (id) => api.delete(`/songs/${id}`),
};
