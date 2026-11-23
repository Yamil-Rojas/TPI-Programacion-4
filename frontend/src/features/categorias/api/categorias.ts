import { axiosInstance } from "../../../shared/api/axiosInstance";
import type { Categoria, CategoriaInput } from "../../productos/types";

export async function crearCategoria(datos: CategoriaInput): Promise<Categoria> {
  const respuesta = await axiosInstance.post<Categoria>("/categorias", datos);
  return respuesta.data;
}

export async function actualizarCategoria(id: number, datos: CategoriaInput): Promise<Categoria> {
  const respuesta = await axiosInstance.put<Categoria>(`/categorias/${id}`, datos);
  return respuesta.data;
}

// Baja lógica de la categoría.
export async function eliminarCategoria(id: number): Promise<void> {
  await axiosInstance.delete(`/categorias/${id}`);
}
