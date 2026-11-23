import { useState } from "react";

import { handleApiError } from "../../../shared/api/handleApiError";
import { EstadoError } from "../../../shared/components/EstadoError";
import { EstadoVacio } from "../../../shared/components/EstadoVacio";
import { Paginacion } from "../../../shared/components/Paginacion";
import { Skeleton } from "../../../shared/components/Skeleton";
import { Button } from "../../../shared/ui/Button";
import { Input } from "../../../shared/ui/Input";
import { useAuthStore } from "../../../store/authStore";
import { ProductoCard } from "../components/ProductoCard";
import { useCategorias, useProductos } from "../hooks/useProductos";

const POR_PAGINA = 8;

export default function CatalogoPage() {
  const esCliente = useAuthStore((s) => s.usuario?.role === "user");

  // Estado de la interfaz (filtros): es local de la pantalla, no del servidor.
  const [pagina, setPagina] = useState(0);
  const [categoriaId, setCategoriaId] = useState<number | undefined>(undefined);
  const [textoBusqueda, setTextoBusqueda] = useState("");
  const [busqueda, setBusqueda] = useState("");

  const categorias = useCategorias();
  const productos = useProductos({
    skip: pagina * POR_PAGINA,
    limit: POR_PAGINA,
    search: busqueda || undefined,
    categoria_id: categoriaId,
    disponible: true,
  });

  const totalPaginas = productos.data ? Math.ceil(productos.data.total / POR_PAGINA) : 0;

  function buscar() {
    setPagina(0);
    setBusqueda(textoBusqueda.trim());
  }

  function elegirCategoria(id: number | undefined) {
    setPagina(0);
    setCategoriaId(id);
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold text-slate-800">Catálogo</h1>

      <form
        className="flex items-end gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          buscar();
        }}
      >
        <div className="flex-1">
          <Input
            etiqueta="Buscar producto"
            placeholder="Ej: hamburguesa"
            value={textoBusqueda}
            onChange={(e) => setTextoBusqueda(e.target.value)}
          />
        </div>
        <Button type="submit">Buscar</Button>
      </form>

      <div className="flex flex-wrap gap-2" aria-label="Categorías">
        <Button
          variante={categoriaId === undefined ? "primary" : "secondary"}
          onClick={() => elegirCategoria(undefined)}
        >
          Todas
        </Button>
        {categorias.data
          ?.filter((c) => c.activo)
          .map((c) => (
            <Button
              key={c.id}
              variante={categoriaId === c.id ? "primary" : "secondary"}
              onClick={() => elegirCategoria(c.id)}
            >
              {c.nombre}
            </Button>
          ))}
      </div>

      {productos.isPending ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: POR_PAGINA }, (_, i) => (
            <Skeleton key={i} className="h-72" />
          ))}
        </div>
      ) : productos.isError ? (
        <EstadoError
          mensaje={handleApiError(productos.error)}
          onReintentar={() => void productos.refetch()}
        />
      ) : productos.data.items.length === 0 ? (
        <EstadoVacio
          mensaje="No se encontraron productos"
          descripcion="Probá con otra búsqueda o categoría."
        />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {productos.data.items.map((p) => (
              <ProductoCard key={p.id} producto={p} puedeComprar={esCliente} />
            ))}
          </div>
          <Paginacion pagina={pagina} totalPaginas={totalPaginas} onCambiar={setPagina} />
        </>
      )}
    </div>
  );
}
