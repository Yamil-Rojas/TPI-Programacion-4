import type { ColumnDef } from "@tanstack/react-table";
import { useState } from "react";

import { handleApiError } from "../../../shared/api/handleApiError";
import { DataTable } from "../../../shared/components/DataTable";
import { EstadoError } from "../../../shared/components/EstadoError";
import { EstadoVacio } from "../../../shared/components/EstadoVacio";
import { Paginacion } from "../../../shared/components/Paginacion";
import { Skeleton } from "../../../shared/components/Skeleton";
import { BadgeEstado } from "../../../shared/ui/BadgeEstado";
import { Button } from "../../../shared/ui/Button";
import { formatearFecha, formatearPrecio } from "../../../shared/utils";
import { useUsuarios } from "../../usuarios/hooks/useUsuarios";
import { PedidoAdminModal } from "../components/PedidoAdminModal";
import { usePedidos } from "../hooks/usePedidos";
import type { EstadoPedido, Pedido } from "../types";

const POR_PAGINA = 10;
const ESTADOS: Array<{ valor: EstadoPedido | undefined; texto: string }> = [
  { valor: undefined, texto: "Todos" },
  { valor: "PENDIENTE", texto: "Pendientes" },
  { valor: "EN_PREPARACION", texto: "En preparación" },
  { valor: "ENTREGADO", texto: "Entregados" },
  { valor: "CANCELADO", texto: "Cancelados" },
];

export default function PedidosAdminPage() {
  const [pagina, setPagina] = useState(0);
  const [estado, setEstado] = useState<EstadoPedido | undefined>(undefined);
  const [seleccionado, setSeleccionado] = useState<Pedido | null>(null);

  const pedidos = usePedidos({ skip: pagina * POR_PAGINA, limit: POR_PAGINA, estado });
  const usuarios = useUsuarios();

  // El pedido solo trae usuario_id: se busca el nombre en la lista de usuarios.
  const nombreDe = (id: number): string =>
    usuarios.data?.find((u) => u.id === id)?.username ?? `#${id}`;

  const columnas: ColumnDef<Pedido>[] = [
    { header: "Pedido", accessorFn: (p) => `#${p.id}` },
    { header: "Cliente", accessorFn: (p) => nombreDe(p.usuario_id) },
    { header: "Fecha", accessorFn: (p) => formatearFecha(p.created_at) },
    { header: "Total", accessorFn: (p) => formatearPrecio(p.total) },
    { header: "Estado", cell: ({ row }) => <BadgeEstado estado={row.original.estado} /> },
    {
      header: "Acciones",
      cell: ({ row }) => (
        <Button variante="secondary" onClick={() => setSeleccionado(row.original)}>
          Ver / cambiar estado
        </Button>
      ),
    },
  ];

  const totalPaginas = pedidos.data ? Math.ceil(pedidos.data.total / POR_PAGINA) : 0;

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold text-slate-800">Pedidos</h1>
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
        <Skeleton className="h-64" />
      ) : pedidos.isError ? (
        <EstadoError
          mensaje={handleApiError(pedidos.error)}
          onReintentar={() => void pedidos.refetch()}
        />
      ) : pedidos.data.items.length === 0 ? (
        <EstadoVacio mensaje="No hay pedidos" descripcion="Probá con otro estado." />
      ) : (
        <>
          <DataTable data={pedidos.data.items} columns={columnas} />
          <Paginacion pagina={pagina} totalPaginas={totalPaginas} onCambiar={setPagina} />
        </>
      )}

      <PedidoAdminModal
        pedido={seleccionado}
        cliente={seleccionado ? nombreDe(seleccionado.usuario_id) : ""}
        onCerrar={() => setSeleccionado(null)}
      />
    </div>
  );
}
