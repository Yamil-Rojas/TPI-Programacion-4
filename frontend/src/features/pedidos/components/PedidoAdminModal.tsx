import { useState } from "react";

import { handleApiError } from "../../../shared/api/handleApiError";
import { BadgeEstado } from "../../../shared/ui/BadgeEstado";
import { Button } from "../../../shared/ui/Button";
import { Modal } from "../../../shared/ui/Modal";
import { formatearFecha, formatearPrecio } from "../../../shared/utils";
import { useCambiarEstado } from "../hooks/usePedidos";
import { TRANSICIONES } from "../types";
import type { EstadoPedido, Pedido } from "../types";

const TEXTO_ACCION: Record<EstadoPedido, string> = {
  PENDIENTE: "Volver a pendiente",
  EN_PREPARACION: "Pasar a en preparación",
  ENTREGADO: "Marcar como entregado",
  CANCELADO: "Cancelar pedido",
};

interface Props {
  pedido: Pedido | null; // abierto cuando hay un pedido
  cliente: string;
  onCerrar: () => void;
}

export function PedidoAdminModal({ pedido, cliente, onCerrar }: Props) {
  return (
    <Modal abierto={pedido !== null} onCerrar={onCerrar} titulo={`Pedido #${pedido?.id ?? ""}`}>
      {pedido && <Contenido pedido={pedido} cliente={cliente} onCerrar={onCerrar} />}
    </Modal>
  );
}

function Contenido({ pedido, cliente, onCerrar }: { pedido: Pedido; cliente: string; onCerrar: () => void }) {
  const cambiar = useCambiarEstado();
  const [error, setError] = useState<string | null>(null);
  // Se muestra el estado devuelto por el servidor tras el cambio (el modal no se cierra solo).
  const [actual, setActual] = useState<Pedido>(pedido);

  async function pasarA(estado: EstadoPedido) {
    setError(null);
    try {
      setActual(await cambiar.mutateAsync({ id: pedido.id, estado }));
    } catch (e) {
      setError(handleApiError(e)); // por ejemplo: transición inválida
    }
  }

  const siguientes = TRANSICIONES[actual.estado];

  return (
    <div className="flex flex-col gap-3 text-sm">
      <div className="flex items-center justify-between">
        <span className="text-slate-600">
          Cliente: <strong>{cliente}</strong>
        </span>
        <BadgeEstado estado={actual.estado} />
      </div>
      <p className="text-slate-600">
        {formatearFecha(actual.created_at)} · {actual.forma_pago === "EFECTIVO" ? "Efectivo" : "Transferencia"}
      </p>
      <p className="text-slate-600">Dirección: {actual.direccion_entrega}</p>
      {actual.notas && <p className="text-slate-600">Notas: {actual.notas}</p>}
      <ul className="divide-y divide-slate-100">
        {actual.items.map((i) => (
          <li key={i.producto_id} className="flex justify-between py-1.5">
            <span>
              {i.cantidad} × {i.nombre_producto}
            </span>
            <span>{formatearPrecio(i.subtotal)}</span>
          </li>
        ))}
      </ul>
      <p className="text-right text-base font-semibold text-slate-800">
        Total: {formatearPrecio(actual.total)}
      </p>
      {error && (
        <p role="alert" className="text-red-600">
          {error}
        </p>
      )}
      <div className="flex flex-wrap justify-end gap-2">
        {siguientes.map((estado) => (
          <Button
            key={estado}
            variante={estado === "CANCELADO" ? "danger" : "primary"}
            cargando={cambiar.isPending}
            onClick={() => void pasarA(estado)}
          >
            {TEXTO_ACCION[estado]}
          </Button>
        ))}
        <Button variante="secondary" onClick={onCerrar}>
          Cerrar
        </Button>
      </div>
    </div>
  );
}
