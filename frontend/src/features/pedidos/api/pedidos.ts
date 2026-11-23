import { axiosInstance } from "../../../shared/api/axiosInstance";
import type { FiltrosPedidos, Pedido, PedidoCreate, PedidosPaginados } from "../types";

export async function crearPedido(datos: PedidoCreate): Promise<Pedido> {
  const respuesta = await axiosInstance.post<Pedido>("/pedidos", datos);
  return respuesta.data;
}

// El backend devuelve solo los pedidos del usuario logueado (o todos si es admin).
export async function listarPedidos(filtros: FiltrosPedidos): Promise<PedidosPaginados> {
  const respuesta = await axiosInstance.get<PedidosPaginados>("/pedidos", { params: filtros });
  return respuesta.data;
}

export async function obtenerPedido(id: number): Promise<Pedido> {
  const respuesta = await axiosInstance.get<Pedido>(`/pedidos/${id}`);
  return respuesta.data;
}

// Cancela un pedido propio en estado PENDIENTE y restituye el stock.
export async function cancelarPedido(id: number): Promise<Pedido> {
  const respuesta = await axiosInstance.patch<Pedido>(`/pedidos/${id}/cancelar`);
  return respuesta.data;
}
