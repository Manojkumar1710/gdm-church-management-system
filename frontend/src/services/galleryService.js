import api from './api';

export const galleryService = {
  list: (page = 0, size = 20) => api.get('/gallery', { params: { page, size } }),
  adminList: (page = 0, size = 20) => api.get('/admin/gallery', { params: { page, size } }),
  create: (file, title, description, category) => {
    const fd = new FormData();
    fd.append('file', file);
    if (title) fd.append('title', title);
    if (description) fd.append('description', description);
    if (category) fd.append('category', category);
    return api.post('/admin/gallery', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
  update: (id, data) => api.patch(`/admin/gallery/${id}`, data),
  delete: (id) => api.delete(`/admin/gallery/${id}`),
};
