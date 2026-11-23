import { useState } from "react";
import { Link, useParams } from "react-router-dom";

import { handleApiError } from "../../../shared/api/handleApiError";
import { EstadoError } from "../../../shared/components/EstadoError";
import { Skeleton } from "../../../shared/components/Skeleton";
import { BadgeEstado } from "../../../shared/ui/BadgeEstado";
import { Button } from "../../../shared/ui/Button";
import { Card } from "../../../shared/ui/Card";
import { Modal } from "../../../shared/ui/Modal";
import { formatearFecha, formatearPrecio } from "../../../shared/utils";
import { useCancelarPedido, usePedido } from "../hooks/usePedidos";

export default function PedidoDetallePage() {
  const { id } = useParams();
  const pedidoId = Number(id);
  const pedido = usePedido(pedidoId);
  const cancelar = useCancelarPedido();
  const [confirmando, setConfirmando] = useState(false);
  const [errorCancelar, setErrorCancelar] = useState<string | null>(null);

  async function confirmarCancelacion() {
    setErrorCancelar(null);
    try {
      await cancelar.mutateAsync(pedidoId);
      setConfirmando(false);
    } catch (error) {
      setErrorCancelar(handleApiError(error));
    }
  }

  if (pedido.isPending) return <Skeleton className="h-64" />;
  if (pedido.isError) {
    return (
      <EstadoError
        mensaje={handleApiError(pedido.error)}
        onReintentar={() => void pedido.refetch()}
      />
    );
  }

  const p = pedido.data;

  return (
    <div className="flex flex-col gap-4">
      <Link to="/mis-pedidos" className="text-sm text-orange-600 hover:underline">
        ← Volver a mis pedidos
      </Link>
      <Card className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h1 className="text-xl font-semibold text-slate-800">Pedido #{p.id}</h1>
          <BadgeEstado estado={p.estado} />
        </div>
        <dl className="grid gap-1 text-sm text-slate-600 sm:grid-cols-2">
          <div>
            <dt className="inline font-medium">Fecha: </dt>
            <dd className="inline">{formatearFecha(p.created_at)}</dd>
          </div>
          <div>
            <dt className="inline font-medium">Forma de pago: </dt>
            <dd className="inline">{p.forma_pago === "EFECTIVO" ? "Efectivo" : "Transferencia"}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="inline font-medium">Dirección: </dt>
            <dd className="inline">{p.direccion_entrega}</dd>
          </div>
          {p.notas && (
            <div className="sm:col-span-2">
              <dt className="inline font-medium">Notas: </dt>
              <dd className="inline">{p.notas}</dd>
            </div>
          )}
        </dl>

        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-slate-500">
              <th className="py-2">Producto</th>
              <th className="py-2 text-right">Precio</th>
              <th className="py-2 text-right">Cant.</th>
              <th className="py-2 text-right">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {p.items.map((i) => (
              <tr key={i.producto_id} className="border-b border-slate-100">
                <td className="py-2">{i.nombre_producto}</td>
                <td className="py-2 text-right">{formatearPrecio(i.precio_unitario)}</td>
                <td className="py-2 text-right">{i.cantidad}</td>
                <td className="py-2 text-right">{formatearPrecio(i.subtotal)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="text-right text-lg font-semibold text-slate-800">
          Total: {formatearPrecio(p.total)}
        </p>

        {/* RN-03: el cliente solo puede cancelar pedidos en PENDIENTE */}
        {p.estado === "PENDIENTE" && (
          <div className="text-right">
            <Button variante="danger" onClick={() => setConfirmando(true)}>
              Cancelar pedido
            </Button>
          </div>
        )}
      </Card>

      <Modal abierto={confirmando} onCerrar={() => setConfirmando(false)} titulo="Cancelar pedido">
        <p className="text-sm text-slate-600">
          ¿Seguro que querés cancelar el pedido #{p.id}? Los productos vuelven al stock.
        </p>
        {errorCancelar && (
          <p role="alert" className="mt-2 text-sm text-red-600">
            {errorCancelar}
          </p>
        )}
        <div className="mt-4 flex justify-end gap-2">
          <Button variante="secondary" onClick={() => setConfirmando(false)}>
            Volver
          </Button>
          <Button variante="danger" cargando={cancelar.isPending} onClick={() => void confirmarCancelacion()}>
            Sí, cancelar
          </Button>
        </div>
      </Modal>
    </div>
  );
}
