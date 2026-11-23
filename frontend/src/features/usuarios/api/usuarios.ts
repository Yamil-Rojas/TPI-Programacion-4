import { axiosInstance } from "../../../shared/api/axiosInstance";
import type { Usuario } from "../../auth/types";

export async function listarUsuarios(): Promise<Usuario[]> {
  const respuesta = await axiosInstance.get<Usuario[]>("/admin/usuarios");
  return respuesta.data;
}

export async function activarUsuario(id: number): Promise<Usuario> {
  const respuesta = await axiosInstance.post<Usuario>(`/admin/usuarios/${id}/activar`);
  return respuesta.data;
}

export async function desactivarUsuario(id: number): Promise<Usuario> {
  const respuesta = await axiosInstance.post<Usuario>(`/admin/usuarios/${id}/desactivar`);
  return respuesta.data;
}
