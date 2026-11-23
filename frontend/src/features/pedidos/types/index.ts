// Tipos del dominio de pedidos (mismos nombres de campo que los schemas del backend).

export type EstadoPedido =
  | "PENDIENTE"
  | "EN_PREPARACION"
  | "ENTREGADO"
  | "CANCELADO";

export type FormaPago = "EFECTIVO" | "TRANSFERENCIA";

// Línea del pedido: nombre y precio quedan COPIADOS al crear el pedido (RN-05).
export interface DetallePedido {
  producto_id: number;
  nombre_producto: string;
  precio_unitario: number;
  cantidad: number;
  subtotal: number;
}

export interface Pedido {
  id: number;
  usuario_id: number;
  estado: EstadoPedido;
  forma_pago: FormaPago;
  direccion_entrega: string;
  notas: string | null;
  total: number;
  created_at: string;
  updated_at: string;
  items: DetallePedido[];
}

export interface PedidosPaginados {
  total: number;
  items: Pedido[];
}

// Cuerpo de POST /pedidos. El precio NO se envía: lo toma el backend.
export interface PedidoCreate {
  items: Array<{ producto_id: number; cantidad: number }>;
  forma_pago: FormaPago;
  direccion_entrega: string;
  notas?: string;
}

export interface FiltrosPedidos {
  skip: number;
  limit: number;
  estado?: EstadoPedido;
}
