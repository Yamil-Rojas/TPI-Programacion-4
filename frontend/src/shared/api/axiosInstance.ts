/**
 * Cliente HTTP ÚNICO de la aplicación.
 *
 * - baseURL: viene de VITE_API_URL (.env).
 * - withCredentials: el navegador adjunta la cookie HttpOnly con el JWT en cada
 *   petición. El frontend NUNCA lee ni guarda el token.
 * - Interceptor de respuesta: si la sesión dejó de ser válida, avisa al
 *   authStore para que la limpie (ver más abajo).
 */
import axios, { isAxiosError } from "axios";

export const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

// El authStore (Etapa 7) se registra acá al crearse. Se hace con una función
// para evitar un import circular: el authStore usa axiosInstance para llamar
// a la API, así que axiosInstance no puede importar el authStore.
let alSesionInvalida: (() => void) | null = null;

export function registrarManejadorSesionInvalida(manejador: () => void): void {
  alSesionInvalida = manejador;
}

const MENSAJE_CUENTA_DESACTIVADA = "Cuenta de usuario desactivada";
// Rutas donde un 401 es normal (credenciales mal, o todavía no hay sesión):
const RUTAS_SIN_LIMPIEZA = ["/auth/token", "/auth/me"];

function esCuentaDesactivada(data: unknown): boolean {
  return (
    typeof data === "object" &&
    data !== null &&
    "detail" in data &&
    data.detail === MENSAJE_CUENTA_DESACTIVADA
  );
}

axiosInstance.interceptors.response.use(
  (respuesta) => respuesta,
  (error: unknown) => {
    if (isAxiosError(error) && error.response) {
      const { status, data } = error.response;
      const url = error.config?.url ?? "";

      const sesionVencida =
        status === 401 && !RUTAS_SIN_LIMPIEZA.some((ruta) => url.includes(ruta));
      const cuentaDesactivada = status === 400 && esCuentaDesactivada(data);

      if (sesionVencida || cuentaDesactivada) {
        alSesionInvalida?.();
      }
    }
    return Promise.reject(error);
  },
);
