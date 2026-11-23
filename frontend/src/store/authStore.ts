/**
 * Estado de la SESIÓN (estado del cliente) con Zustand.
 *
 * - usuario:  el usuario logueado (nombre, email, rol...) o null.
 * - cargando: true hasta que checkSession confirma si hay sesión válida.
 * - persist + partialize: en localStorage se guarda SOLO "usuario". El token
 *   nunca pasa por el frontend: viaja en una cookie HttpOnly.
 *
 * La fuente de verdad es el backend: al abrir la app, checkSession consulta
 * /auth/me y corrige lo que haya quedado guardado en localStorage.
 */
import { create } from "zustand";
import { persist } from "zustand/middleware";

import {
  loginRequest,
  logoutRequest,
  obtenerPerfil,
} from "../features/auth/api/auth";
import type { Usuario } from "../features/auth/types";
import { registrarManejadorSesionInvalida } from "../shared/api/axiosInstance";

interface AuthState {
  usuario: Usuario | null;
  cargando: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkSession: () => Promise<void>;
  limpiarSesion: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      usuario: null,
      cargando: true, // hasta que checkSession responda

      // Si las credenciales son incorrectas, lanza el error (lo muestra la página).
      login: async (username, password) => {
        await loginRequest(username, password); // el backend deja la cookie
        const usuario = await obtenerPerfil();
        set({ usuario });
      },

      // Pide al backend que borre la cookie y limpia el usuario, pase lo que pase.
      logout: async () => {
        try {
          await logoutRequest();
        } finally {
          set({ usuario: null });
        }
      },

      // Se llama una vez al montar la aplicación (App.tsx).
      checkSession: async () => {
        set({ cargando: true });
        try {
          set({ usuario: await obtenerPerfil() });
        } catch {
          set({ usuario: null }); // sin sesión válida (401) o servidor caído
        } finally {
          set({ cargando: false });
        }
      },

      limpiarSesion: () => set({ usuario: null }),
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({ usuario: state.usuario }),
    },
  ),
);

// El interceptor de Axios no puede importar este store (import circular), así
// que el store se registra acá: ante un 401 de sesión vencida o una cuenta
// desactivada, el interceptor llama a limpiarSesion().
registrarManejadorSesionInvalida(() => {
  useAuthStore.getState().limpiarSesion();
});
