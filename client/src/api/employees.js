import api from './axios';

export async function getAllEmployees({ search, department_id } = {}) {
  const response = await api.get('/employees', { params: { search, department_id } });
  return response.data;
}

export async function getEmployeeById(id) {
  const response = await api.get(`/employees/${id}`);
  return response.data;
}

export async function getMyProfile() {
  const response = await api.get('/employees/me');
  return response.data;
}

export async function updateMyProfile(full_name) {
  const response = await api.put('/employees/me', { full_name });
  return response.data;
}

export async function createEmployee({ full_name, email, temporary_password, role }) {
  const response = await api.post('/employees', { full_name, email, temporary_password, role });
  return response.data;
}

export async function updateEmployee(id, { full_name, department_ids }) {
  const response = await api.put(`/employees/${id}`, { full_name, department_ids });
  return response.data;
}

export async function setEmployeeActiveStatus(id, is_active) {
  const response = await api.patch(`/employees/${id}/status`, { is_active });
  return response.data;
}
