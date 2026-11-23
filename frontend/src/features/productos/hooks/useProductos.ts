/**
 * Hooks de TanStack Query para el catálogo (estado del SERVIDOR).
 * La queryKey incluye los filtros: si cambian, se pide la lista correspondiente.
 */
import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { listarCategorias, listarProductos } from "../api/productos";
import type { FiltrosProductos } from "../types";

export function useProductos(filtros: FiltrosProductos) {
  return useQuery({
    queryKey: ["productos", filtros],
    queryFn: () => listarProductos(filtros),
    placeholderData: keepPreviousData, // mantiene la página anterior mientras carga la nueva
  });
}

export function useCategorias() {
  return useQuery({
    queryKey: ["categorias"],
    queryFn: listarCategorias,
    staleTime: 5 * 60 * 1000, // las categorías cambian poco
  });
}
