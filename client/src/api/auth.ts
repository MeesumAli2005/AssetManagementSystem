// just the change-password call, login/logout live in AuthContext instead
import api from "./axios";

export async function changePassword(
  current_password: string,
  new_password: string,
  confirm_password: string,
) {
  const response = await api.post<{ message: string }>("/auth/change-password", {
    current_password,
    new_password,
    confirm_password,
  });
  return response.data;
}
