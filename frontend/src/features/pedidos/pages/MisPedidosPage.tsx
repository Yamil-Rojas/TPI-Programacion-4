import { useState } from "react";
import { Link } from "react-router-dom";

import { handleApiError } from "../../../shared/api/handleApiError";
import { EstadoError } from "../../../shared/components/EstadoError";
import { EstadoVacio } from "../../../shared/components/EstadoVacio";
import { Paginacion } from "../../../shared/components/Paginacion";
import { Skeleton } from "../../../shared/components/Skeleton";
import { BadgeEstado } from "../../../shared/ui/BadgeEstado";
import { Button } from "../../../shared/ui/Button";
import { Card } from "../../../shared/ui/Card";
import { formatearFecha, formatearPrecio } from "../../../shared/utils";
import { usePedidos } from "../hooks/usePedidos";
import type { EstadoPedido } from "../types";

const POR_PAGINA = 10;
const ESTADOS: Array<{ valor: EstadoPedido | undefined; texto: string }> = [
  { valor: undefined, texto: "Todos" },
  { valor: "PENDIENTE", texto: "Pendientes" },
  { valor: "EN_PREPARACION", texto: "En preparación" },
  { valor: "ENTREGADO", texto: "Entregados" },
  { valor: "CANCELADO", texto: "Cancelados" },
];

export default function MisPedidosPage() {
  const [pagina, setPagina] = useState(0);
  const [estado, setEstado] = useState<EstadoPedido | undefined>(undefined);
  const pedidos = usePedidos({ skip: pagina * POR_PAGINA, limit: POR_PAGINA, estado });

  const totalPaginas = pedidos.data ? Math.ceil(pedidos.data.total / POR_PAGINA) : 0;

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold text-slate-800">Mis pedidos</h1>

      <div className="flex flex-wrap gap-2" aria-label="Filtrar por estado">
        {ESTADOS.map((e) => (
          <Button
            key={e.texto}
            variante={estado === e.valor ? "primary" : "secondary"}
            onClick={() => {
              setPagina(0);
              setEstado(e.valor);
            }}
          >
            {e.texto}
          </Button>
        ))}
      </div>

      {pedidos.isPending ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton key={i} className="h-16" />
          ))}
        </div>
      ) : pedidos.isError ? (
        <EstadoError
          mensaje={handleApiError(pedidos.error)}
          onReintentar={() => void pedidos.refetch()}
        />
      ) : pedidos.data.items.length === 0 ? (
        <EstadoVacio
          mensaje="No tenés pedidos"
          descripcion="Cuando hagas una compra la vas a ver acá."
          accion={
            <Link to="/" className="text-orange-600 hover:underline">
              Ir al catálogo
            </Link>
          }
        />
      ) : (
        <>
          <div className="flex flex-col gap-3">
            {pedidos.data.items.map((p) => (
              <Card key={p.id} className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-slate-800">Pedido #{p.id}</p>
                  <p className="text-sm text-slate-500">{formatearFecha(p.created_at)}</p>
                </div>
                <BadgeEstado estado={p.estado} />
                <p className="font-semibold text-slate-800">{formatearPrecio(p.total)}</p>
                <Link
                  to={`/mis-pedidos/${p.id}`}
                  className="text-sm text-orange-600 hover:underline"
                >
                  Ver detalle
                </Link>
              </Card>
            ))}
          </div>
          <Paginacion pagina={pagina} totalPaginas={totalPaginas} onCambiar={setPagina} />
        </>
      )}
    </div>
  );
}
