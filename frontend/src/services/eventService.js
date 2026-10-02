import api from './api';

export const eventService = {
  getUpcoming: () => api.get('/events/upcoming'),
  list: (page = 0, size = 20) => api.get('/events', { params: { page, size } }),
  getById: (id) => api.get(`/events/${id}`),
  getPhotos: (id) => api.get(`/events/${id}/photos`),
  getLatestPhotos: (limit = 15) => api.get('/event-photos/latest', { params: { limit } }),
  // Admin
  adminList: (page = 0, size = 20) => api.get('/admin/events', { params: { page, size } }),
  create: (data) => api.post('/admin/events', data),
  update: (id, data) => api.put(`/admin/events/${id}`, data),
  uploadImage: (id, file) => {
    const fd = new FormData();
    fd.append('file', file);
    return api.post(`/admin/events/${id}/image`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
  delete: (id) => api.delete(`/admin/events/${id}`),
  // Event Photos — Admin
  uploadPhotos: (eventId, files, meta = {}) => {
    const fd = new FormData();
    files.forEach((f) => fd.append('files', f));
    if (meta.title) fd.append('title', meta.title);
    if (meta.description) fd.append('description', meta.description);
    if (meta.location) fd.append('location', meta.location);
    return api.post(`/admin/events/${eventId}/photos`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
  adminListPhotos: (eventId, page = 0, size = 20) =>
    api.get('/admin/event-photos', { params: { eventId, page, size } }),
  updatePhoto: (id, data) => api.patch(`/admin/event-photos/${id}`, data),
  deletePhoto: (id) => api.delete(`/admin/event-photos/${id}`),
};
