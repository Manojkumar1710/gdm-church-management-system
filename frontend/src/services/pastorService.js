import api from './api';

export const pastorService = {
  list: () => api.get('/pastors'),
  getSchedule: (from, to) => api.get('/pastor-schedule', { params: { from, to } }),
  // Admin
  adminList: (page = 0, size = 20) => api.get('/admin/pastors', { params: { page, size } }),
  getById: (id) => api.get(`/admin/pastors/${id}`),
  create: (data) => api.post('/admin/pastors', data),
  update: (id, data) => api.put(`/admin/pastors/${id}`, data),
  uploadPhoto: (id, file) => {
    const fd = new FormData();
    fd.append('file', file);
    return api.post(`/admin/pastors/${id}/photo`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
  delete: (id) => api.delete(`/admin/pastors/${id}`),
  getPastorSchedules: (id) => api.get(`/admin/pastors/${id}/schedules`),
  createSchedule: (data) => api.post('/admin/pastor-schedule', data),
  updateSchedule: (id, data) => api.put(`/admin/pastor-schedule/${id}`, data),
  deleteSchedule: (id) => api.delete(`/admin/pastor-schedule/${id}`),
};
