import { Link } from "react-router-dom";

import { EstadoVacio } from "../../../shared/components/EstadoVacio";
import { Button } from "../../../shared/ui/Button";
import { Card } from "../../../shared/ui/Card";
import { formatearPrecio } from "../../../shared/utils";
import { totalCarrito, useCartStore } from "../../../store/cartStore";

export default function CarritoPage() {
  const items = useCartStore((s) => s.items);
  const cambiarCantidad = useCartStore((s) => s.cambiarCantidad);
  const quitar = useCartStore((s) => s.quitar);
  const vaciar = useCartStore((s) => s.vaciar);

  if (items.length === 0) {
    return (
      <EstadoVacio
        mensaje="Tu carrito está vacío"
        descripcion="Agregá productos desde el catálogo."
        accion={
          <Link to="/" className="text-orange-600 hover:underline">
            Ir al catálogo
          </Link>
        }
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold text-slate-800">Carrito</h1>
      <Card className="divide-y divide-slate-100 p-0">
        {items.map((item) => (
          <div key={item.producto_id} className="flex flex-wrap items-center gap-3 p-4">
            <div className="min-w-40 flex-1">
              <p className="font-medium text-slate-800">{item.nombre}</p>
              <p className="text-sm text-slate-500">{formatearPrecio(item.precio_unitario)} c/u</p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variante="secondary"
                aria-label={`Restar ${item.nombre}`}
                disabled={item.cantidad <= 1}
                onClick={() => cambiarCantidad(item.producto_id, item.cantidad - 1)}
              >
                −
              </Button>
              <span className="w-8 text-center" aria-label={`Cantidad de ${item.nombre}`}>
                {item.cantidad}
              </span>
              <Button
                variante="secondary"
                aria-label={`Sumar ${item.nombre}`}
                disabled={item.cantidad >= item.stock}
                onClick={() => cambiarCantidad(item.producto_id, item.cantidad + 1)}
              >
                +
              </Button>
            </div>
            <p className="w-28 text-right font-semibold text-slate-800">
              {formatearPrecio(item.precio_unitario * item.cantidad)}
            </p>
            <Button variante="ghost" onClick={() => quitar(item.producto_id)}>
              Quitar
            </Button>
          </div>
        ))}
      </Card>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button variante="secondary" onClick={vaciar}>
          Vaciar carrito
        </Button>
        <div className="flex items-center gap-4">
          <p className="text-lg font-semibold text-slate-800">
            Total: {formatearPrecio(totalCarrito(items))}
          </p>
          <Link
            to="/checkout"
            className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700"
          >
            Continuar al checkout
          </Link>
        </div>
      </div>
    </div>
  );
}
