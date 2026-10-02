import api from './api';

export const sermonService = {
  list: (page = 0, size = 20) => api.get('/sermons', { params: { page, size } }),
  getById: (id) => api.get(`/sermons/${id}`),
  adminList: (page = 0, size = 20) => api.get('/admin/sermons', { params: { page, size } }),
  create: (data) => api.post('/admin/sermons', data),
  update: (id, data) => api.put(`/admin/sermons/${id}`, data),
  uploadThumbnail: (id, file) => {
    const fd = new FormData();
    fd.append('file', file);
    return api.post(`/admin/sermons/${id}/thumbnail`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
  delete: (id) => api.delete(`/admin/sermons/${id}`),
};

export const youtubeService = {
  list: (page = 0, size = 20) => api.get('/youtube', { params: { page, size } }),
  adminList: (page = 0, size = 20) => api.get('/admin/youtube', { params: { page, size } }),
  create: (data) => api.post('/admin/youtube', data),
  update: (id, data) => api.put(`/admin/youtube/${id}`, data),
  delete: (id) => api.delete(`/admin/youtube/${id}`),
};
