import api from './api';

export const sundaySchoolService = {
  getPrograms: (page = 0, size = 20) => api.get('/sunday-school/programs', { params: { page, size } }),
  // Admin
  listChildren: (page = 0, size = 20) => api.get('/admin/sunday-school/children', { params: { page, size } }),
  createChild: (data) => api.post('/admin/sunday-school/children', data),
  updateChild: (id, data) => api.put(`/admin/sunday-school/children/${id}`, data),
  deleteChild: (id) => api.delete(`/admin/sunday-school/children/${id}`),
  deactivateChild: (id) => api.patch(`/admin/sunday-school/children/${id}/deactivate`),
  listTeachers: (page = 0, size = 20) => api.get('/admin/sunday-school/teachers', { params: { page, size } }),
  createTeacher: (data) => api.post('/admin/sunday-school/teachers', data),
  updateTeacher: (id, data) => api.put(`/admin/sunday-school/teachers/${id}`, data),
  deleteTeacher: (id) => api.delete(`/admin/sunday-school/teachers/${id}`),
  listPrograms: (page = 0, size = 20) => api.get('/admin/sunday-school/programs', { params: { page, size } }),
  createProgram: (formData) => api.post('/admin/sunday-school/programs', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  updateProgram: (id, data) => api.put(`/admin/sunday-school/programs/${id}`, data),
  deleteProgram: (id) => api.delete(`/admin/sunday-school/programs/${id}`),
};
