import api from './api';

export const prayerService = {
  submit: (data) => api.post('/prayer-requests', data),
  adminList: (page = 0, size = 20) => api.get('/admin/prayer-requests', { params: { page, size } }),
  updateStatus: (id, status, note = '') => api.patch(`/admin/prayer-requests/${id}/status`, { status, note }),
};

export const contactService = {
  submit: (data) => api.post('/contact-messages', data),
  adminList: (page = 0, size = 20) => api.get('/admin/contact-messages', { params: { page, size } }),
  updateStatus: (id, status) => api.patch(`/admin/contact-messages/${id}/status`, { status }),
};
