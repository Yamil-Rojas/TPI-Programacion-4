/**
 * Funciones que llaman a los endpoints de /auth con la instancia única de Axios.
 * El JWT viaja en una cookie HttpOnly: acá nunca se lee ni se guarda ningún token.
 */
import { axiosInstance } from "../../../shared/api/axiosInstance";
import type { DatosRegistro, Usuario } from "../types";

// POST /auth/token usa un formulario (OAuth2): application/x-www-form-urlencoded.
// El backend responde con la cookie; el cuerpo solo trae un mensaje.
export async function loginRequest(username: string, password: string): Promise<void> {
  const cuerpo = new URLSearchParams({ username, password });
  await axiosInstance.post("/auth/token", cuerpo);
}

export async function registerRequest(datos: DatosRegistro): Promise<Usuario> {
  const respuesta = await axiosInstance.post<Usuario>("/auth/register", datos);
  return respuesta.data;
}

export async function logoutRequest(): Promise<void> {
  await axiosInstance.post("/auth/logout");
}

// GET /auth/me: devuelve el usuario de la sesión (o 401 si no hay).
export async function obtenerPerfil(): Promise<Usuario> {
  const respuesta = await axiosInstance.get<Usuario>("/auth/me");
  return respuesta.data;
}
