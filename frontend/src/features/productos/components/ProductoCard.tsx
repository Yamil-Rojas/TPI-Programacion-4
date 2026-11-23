import { useCartStore } from "../../../store/cartStore";
import { formatearPrecio } from "../../../shared/utils";
import { Button } from "../../../shared/ui/Button";
import { Card } from "../../../shared/ui/Card";
import type { Producto } from "../types";

interface ProductoCardProps {
  producto: Producto;
}

export function ProductoCard({ producto }: ProductoCardProps) {
  const agregar = useCartStore((s) => s.agregar);
  const enCarrito = useCartStore(
    (s) => s.items.find((i) => i.producto_id === producto.id)?.cantidad ?? 0,
  );
  const sinStock = producto.stock <= 0;
  const llegoAlTope = enCarrito >= producto.stock;

  return (
    <Card className="flex flex-col gap-2">
      {producto.imagen_url ? (
        <img
          src={producto.imagen_url}
          alt={producto.nombre}
          className="h-36 w-full rounded-lg object-cover"
        />
      ) : (
        <div className="flex h-36 items-center justify-center rounded-lg bg-slate-100 text-sm text-slate-400">
          Sin imagen
        </div>
      )}
      <div className="flex items-start justify-between gap-2">
        <h2 className="font-semibold text-slate-800">{producto.nombre}</h2>
        <span className="whitespace-nowrap font-semibold text-orange-600">
          {formatearPrecio(producto.precio_base)}
        </span>
      </div>
      {producto.categoria && (
        <span className="text-xs text-slate-500">{producto.categoria.nombre}</span>
      )}
      {producto.descripcion && (
        <p className="line-clamp-2 text-sm text-slate-600">{producto.descripcion}</p>
      )}
      <p className={`text-xs ${sinStock ? "text-red-600" : "text-slate-500"}`}>
        {sinStock ? "Sin stock" : `Stock: ${producto.stock}`}
      </p>
      <Button
        className="mt-auto"
        disabled={sinStock || llegoAlTope}
        onClick={() => agregar(producto)}
      >
        {sinStock ? "No disponible" : llegoAlTope ? "Máximo en carrito" : "Agregar al carrito"}
      </Button>
    </Card>
  );
}
