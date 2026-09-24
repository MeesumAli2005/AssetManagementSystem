// department crud calls
import api from "./axios";
import type { Department } from "../types";

export async function getAllDepartments() {
  const response = await api.get<Department[]>("/departments");
  return response.data;
}

export async function createDepartment(name: string) {
  const response = await api.post<Department>("/departments", { name });
  return response.data;
}

export async function updateDepartment(
  id: number,
  { name, is_active }: { name: string; is_active: boolean },
) {
  const response = await api.put<{ message: string }>(`/departments/${id}`, {
    name,
    is_active,
  });
  return response.data;
}

export async function deleteDepartment(id: number) {
  const response = await api.delete<{ message: string }>(`/departments/${id}`);
  return response.data;
}
