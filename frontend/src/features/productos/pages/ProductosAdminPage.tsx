import type { ColumnDef } from "@tanstack/react-table";
import { useState } from "react";

import { handleApiError } from "../../../shared/api/handleApiError";
import { DataTable } from "../../../shared/components/DataTable";
import { EstadoError } from "../../../shared/components/EstadoError";
import { EstadoVacio } from "../../../shared/components/EstadoVacio";
import { Skeleton } from "../../../shared/components/Skeleton";
import { Button } from "../../../shared/ui/Button";
import { ConfirmModal } from "../../../shared/ui/ConfirmModal";
import { Input } from "../../../shared/ui/Input";
import { Select } from "../../../shared/ui/Select";
import { formatearPrecio } from "../../../shared/utils";
import { ProductoFormModal } from "../components/ProductoFormModal";
import { StockModal } from "../components/StockModal";
import { useCategorias, useProductos } from "../hooks/useProductos";
import { useEliminarProducto } from "../hooks/useProductosAdmin";
import type { Producto } from "../types";

// El panel pide hasta 100 productos y la tabla (TanStack Table) los pagina del lado del cliente.
const LIMITE = 100;

export default function ProductosAdminPage() {
  const [categoriaId, setCategoriaId] = useState<number | undefined>(undefined);
  const [textoBusqueda, setTextoBusqueda] = useState("");
  const [busqueda, setBusqueda] = useState("");

  // Sin filtro "disponible": el admin ve también los productos no disponibles.
  const productos = useProductos({
    skip: 0,
    limit: LIMITE,
    search: busqueda || undefined,
    categoria_id: categoriaId,
  });
  const categorias = useCategorias();
  const eliminar = useEliminarProducto();

  const [formAbierto, setFormAbierto] = useState(false);
  const [aEditar, setAEditar] = useState<Producto | null>(null);
  const [aStock, setAStock] = useState<Producto | null>(null);
  const [aEliminar, setAEliminar] = useState<Producto | null>(null);
  const [errorEliminar, setErrorEliminar] = useState<string | null>(null);

  const columnas: ColumnDef<Producto>[] = [
    { header: "Nombre", accessorFn: (p) => p.nombre },
    { header: "Categoría", accessorFn: (p) => p.categoria?.nombre ?? "—" },
    { header: "Precio", accessorFn: (p) => formatearPrecio(p.precio_base) },
    { header: "Stock", accessorFn: (p) => p.stock },
    {
      header: "Disponible",
      cell: ({ row }) =>
        row.original.disponible ? (
          <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-800">Sí</span>
        ) : (
          <span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs text-slate-700">No</span>
        ),
    },
    {
      header: "Acciones",
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-2">
          <Button
            variante="secondary"
            onClick={() => {
              setAEditar(row.original);
              setFormAbierto(true);
            }}
          >
            Editar
          </Button>
          <Button variante="secondary" onClick={() => setAStock(row.original)}>
            Stock
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
        <h1 className="text-2xl font-semibold text-slate-800">Productos</h1>
        <Button
          onClick={() => {
            setAEditar(null);
            setFormAbierto(true);
          }}
        >
          Nuevo producto
        </Button>
      </div>

      <form
        className="flex flex-wrap items-end gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          setBusqueda(textoBusqueda.trim());
        }}
      >
        <div className="min-w-48 flex-1">
          <Input
            etiqueta="Buscar producto"
            value={textoBusqueda}
            onChange={(e) => setTextoBusqueda(e.target.value)}
          />
        </div>
        <Select
          etiqueta="Filtrar por categoría"
          value={categoriaId === undefined ? "" : String(categoriaId)}
          onChange={(e) => {
            setCategoriaId(e.target.value ? Number(e.target.value) : undefined);
          }}
        >
          <option value="">Todas</option>
          {categorias.data?.map((c) => (
            <option key={c.id} value={String(c.id)}>
              {c.nombre}
            </option>
          ))}
        </Select>
        <Button type="submit">Buscar</Button>
      </form>

      {productos.isPending ? (
        <Skeleton className="h-64" />
      ) : productos.isError ? (
        <EstadoError
          mensaje={handleApiError(productos.error)}
          onReintentar={() => void productos.refetch()}
        />
      ) : productos.data.items.length === 0 ? (
        <EstadoVacio mensaje="No se encontraron productos" />
      ) : (
        <DataTable data={productos.data.items} columns={columnas} />
      )}

      <ProductoFormModal
        abierto={formAbierto}
        producto={aEditar}
        onCerrar={() => setFormAbierto(false)}
      />
      <StockModal producto={aStock} onCerrar={() => setAStock(null)} />
      <ConfirmModal
        abierto={aEliminar !== null}
        titulo="Eliminar producto"
        mensaje={`¿Eliminar el producto "${aEliminar?.nombre ?? ""}"?`}
        textoConfirmar="Sí, eliminar"
        cargando={eliminar.isPending}
        error={errorEliminar}
        onConfirmar={() => void confirmarEliminar()}
        onCerrar={() => setAEliminar(null)}
      />
    </div>
  );
}
