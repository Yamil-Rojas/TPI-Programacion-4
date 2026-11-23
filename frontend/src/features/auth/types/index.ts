// Tipos del dominio de autenticación (mismos nombres de campo que el backend).

export type Rol = "user" | "admin";

// Coincide con el schema UserPublic del backend (nunca trae hashed_password).
export interface Usuario {
  id: number;
  username: string;
  full_name: string;
  email: string;
  role: Rol;
  disabled: boolean;
  created_at: string;
}

// Cuerpo de POST /auth/register (schema UserCreate).
export interface DatosRegistro {
  username: string;
  full_name: string;
  email: string;
  password: string;
}
