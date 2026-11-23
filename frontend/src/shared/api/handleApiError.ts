/**
 * Convierte cualquier error en un mensaje legible para mostrar en pantalla.
 *
 * El backend responde los errores como { "detail": ... }:
 *  - detail es un texto  -> (400, 401, 403, 404, 409)
 *  - detail es una lista -> errores de validación del 422
 */
import { isAxiosError } from "axios";

interface ErrorDeValidacion {
  msg: string;
  loc?: Array<string | number>;
}

function esErrorDeValidacion(valor: unknown): valor is ErrorDeValidacion {
  return (
    typeof valor === "object" &&
    valor !== null &&
    "msg" in valor &&
    typeof valor.msg === "string"
  );
}

export function handleApiError(error: unknown): string {
  if (isAxiosError(error)) {
    if (!error.response) {
      return "No se pudo conectar con el servidor. Verificá que esté en funcionamiento.";
    }

    const data: unknown = error.response.data;
    if (typeof data === "object" && data !== null && "detail" in data) {
      const detail: unknown = data.detail;

      if (typeof detail === "string") {
        return detail;
      }
      if (Array.isArray(detail)) {
        const mensajes = detail.filter(esErrorDeValidacion).map((e) => e.msg);
        if (mensajes.length > 0) {
          return mensajes.join(". ");
        }
      }
    }
    return `Error ${error.response.status} del servidor.`;
  }

  if (error instanceof Error) {
    return error.message;
  }
  return "Ocurrió un error inesperado.";
}
