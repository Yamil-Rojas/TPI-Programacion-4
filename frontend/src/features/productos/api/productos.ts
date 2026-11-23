import { axiosInstance } from "../../../shared/api/axiosInstance";
import type {
  Categoria,
  FiltrosProductos,
  Producto,
  ProductoInput,
  ProductosPaginados,
  StockInput,
} from "../types";

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

// --- Operaciones del administrador ---

export async function crearProducto(datos: ProductoInput): Promise<Producto> {
  const respuesta = await axiosInstance.post<Producto>("/productos", datos);
  return respuesta.data;
}

export async function actualizarProducto(id: number, datos: ProductoInput): Promise<Producto> {
  const respuesta = await axiosInstance.put<Producto>(`/productos/${id}`, datos);
  return respuesta.data;
}

export async function actualizarStock(id: number, datos: StockInput): Promise<Producto> {
  const respuesta = await axiosInstance.patch<Producto>(`/productos/${id}/stock`, datos);
  return respuesta.data;
}

// Baja lógica: el producto queda inactivo, no se borra de la base.
export async function eliminarProducto(id: number): Promise<void> {
  await axiosInstance.delete(`/productos/${id}`);
}
