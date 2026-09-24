// employee-facing api calls, profile stuff and admin employee management
import api from "./axios";
import type { Employee, EmployeeProfile, MyProfile } from "../types";
import type { Role } from "../constants";

export async function getAllEmployees({
  search,
  department_id,
}: { search?: string | undefined; department_id?: number | undefined } = {}) {
  const response = await api.get<Employee[]>("/employees", {
    params: { search, department_id },
  });
  return response.data;
}

export async function getEmployeeById(id: number) {
  const response = await api.get<EmployeeProfile>(`/employees/${id}`);
  return response.data;
}

export async function getMyProfile() {
  const response = await api.get<MyProfile>("/employees/me");
  return response.data;
}

export async function updateMyProfile(full_name: string) {
  const response = await api.put<{ message: string }>("/employees/me", {
    full_name,
  });
  return response.data;
}

export async function createEmployee({
  full_name,
  email,
  temporary_password,
  role,
}: {
  full_name: string;
  email: string;
  temporary_password: string;
  role: Role;
}) {
  const response = await api.post<{ id: number; email: string; role: string }>(
    "/employees",
    { full_name, email, temporary_password, role },
  );
  return response.data;
}

export async function updateEmployee(
  id: number,
  { full_name, department_ids }: { full_name: string; department_ids: number[] },
) {
  const response = await api.put<{ message: string }>(`/employees/${id}`, {
    full_name,
    department_ids,
  });
  return response.data;
}

export async function setEmployeeActiveStatus(id: number, is_active: boolean) {
  const response = await api.patch<{ message: string }>(
    `/employees/${id}/status`,
    { is_active },
  );
  return response.data;
}

export async function resetEmployeePassword(
  user_id: number,
  temporary_password: string,
) {
  const response = await api.post<{ message: string }>(
    "/admin/employees/reset-password",
    { user_id, temporary_password },
  );
  return response.data;
}
