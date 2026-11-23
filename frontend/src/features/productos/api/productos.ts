import { axiosInstance } from "../../../shared/api/axiosInstance";
import type { Categoria, FiltrosProductos, ProductosPaginados } from "../types";

export async function listarProductos(filtros: FiltrosProductos): Promise<ProductosPaginados> {
  const respuesta = await axiosInstance.get<ProductosPaginados>("/productos", {
    params: filtros, // axios omite los valores undefined
  });
  return respuesta.data;
}

export async function listarCategorias(): Promise<Categoria[]> {
  const respuesta = await axiosInstance.get<Categoria[]>("/categorias");
  return respuesta.data;
}
