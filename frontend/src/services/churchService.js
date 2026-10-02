import api from './api';

export const churchService = {
  getInfo: () => api.get('/church'),
  getHero: () => api.get('/hero'),
  // Admin
  updateInfo: (data) => api.put('/admin/church', data),
  listHeroes: () => api.get('/admin/heroes'),
  createHero: (data) => api.post('/admin/heroes', data),
  updateHero: (id, data) => api.put(`/admin/heroes/${id}`, data),
  uploadHeroImage: (id, file) => {
    const fd = new FormData();
    fd.append('file', file);
    return api.post(`/admin/heroes/${id}/image`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
  deleteHero: (id) => api.delete(`/admin/heroes/${id}`),
};
