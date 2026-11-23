// Tipos del dominio de pedidos (mismos nombres de campo que los schemas del backend).
// En la etapa de pedidos se suman Pedido, DetallePedido y ResumenPedidos.

export type EstadoPedido =
  | "PENDIENTE"
  | "EN_PREPARACION"
  | "ENTREGADO"
  | "CANCELADO";
