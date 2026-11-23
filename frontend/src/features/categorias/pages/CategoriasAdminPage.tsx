import type { ColumnDef } from "@tanstack/react-table";
import { useState } from "react";

import { handleApiError } from "../../../shared/api/handleApiError";
import { DataTable } from "../../../shared/components/DataTable";
import { EstadoError } from "../../../shared/components/EstadoError";
import { EstadoVacio } from "../../../shared/components/EstadoVacio";
import { Skeleton } from "../../../shared/components/Skeleton";
import { Button } from "../../../shared/ui/Button";
import { ConfirmModal } from "../../../shared/ui/ConfirmModal";
import { useCategorias } from "../../productos/hooks/useProductos";
import type { Categoria } from "../../productos/types";
import { CategoriaFormModal } from "../components/CategoriaFormModal";
import { useEliminarCategoria } from "../hooks/useCategoriasAdmin";

export default function CategoriasAdminPage() {
  const categorias = useCategorias();
  const eliminar = useEliminarCategoria();

  const [formAbierto, setFormAbierto] = useState(false);
  const [aEditar, setAEditar] = useState<Categoria | null>(null);
  const [aEliminar, setAEliminar] = useState<Categoria | null>(null);
  const [errorEliminar, setErrorEliminar] = useState<string | null>(null);

  const columnas: ColumnDef<Categoria>[] = [
    { header: "Nombre", accessorFn: (c) => c.nombre },
    { header: "Descripción", accessorFn: (c) => c.descripcion ?? "—" },
    {
      header: "Acciones",
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button
            variante="secondary"
            onClick={() => {
              setAEditar(row.original);
              setFormAbierto(true);
            }}
          >
            Editar
          </Button>
          <Button
            variante="danger"
            onClick={() => {
              setErrorEliminar(null);
              setAEliminar(row.original);
            }}
          >
            Eliminar
          </Button>
        </div>
      ),
    },
  ];

  async function confirmarEliminar() {
    if (!aEliminar) return;
    try {
      await eliminar.mutateAsync(aEliminar.id);
      setAEliminar(null);
    } catch (error) {
      setErrorEliminar(handleApiError(error));
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-800">Categorías</h1>
        <Button
          onClick={() => {
            setAEditar(null);
            setFormAbierto(true);
          }}
        >
          Nueva categoría
        </Button>
      </div>

      {categorias.isPending ? (
        <Skeleton className="h-40" />
      ) : categorias.isError ? (
        <EstadoError
          mensaje={handleApiError(categorias.error)}
          onReintentar={() => void categorias.refetch()}
        />
      ) : categorias.data.length === 0 ? (
        <EstadoVacio mensaje="No hay categorías" descripcion="Creá la primera con el botón de arriba." />
      ) : (
        <DataTable data={categorias.data} columns={columnas} />
      )}

      <CategoriaFormModal
        abierto={formAbierto}
        categoria={aEditar}
        onCerrar={() => setFormAbierto(false)}
      />
      <ConfirmModal
        abierto={aEliminar !== null}
        titulo="Eliminar categoría"
        mensaje={`¿Eliminar la categoría "${aEliminar?.nombre ?? ""}"?`}
        textoConfirmar="Sí, eliminar"
        cargando={eliminar.isPending}
        error={errorEliminar}
        onConfirmar={() => void confirmarEliminar()}
        onCerrar={() => setAEliminar(null)}
      />
    </div>
  );
}
