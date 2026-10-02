import api from './api';

export const offeringService = {
  getPurposes: () => api.get('/offering-purposes'),
  submit: (data) => api.post('/offerings', data),
  // Admin
  adminList: (page = 0, size = 20) => api.get('/admin/offerings', { params: { page, size } }),
  adminCreate: (data) => api.post('/admin/offerings', data),
  updateStatus: (id, status) => api.patch(`/admin/offerings/${id}/status`, { status }),
  createPurpose: (data) => api.post('/admin/offering-purposes', data),
  deletePurpose: (id) => api.delete(`/admin/offering-purposes/${id}`),
};
