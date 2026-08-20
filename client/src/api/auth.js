import api from './axios';

export async function changePassword(current_password, new_password, confirm_password) {
  const response = await api.post('/auth/change-password', {
    current_password,
    new_password,
    confirm_password,
  });
  return response.data;
}
