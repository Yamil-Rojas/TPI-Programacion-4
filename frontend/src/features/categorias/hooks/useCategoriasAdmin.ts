/** Mutaciones de categorías (admin). Al terminar, se refrescan las listas afectadas. */
import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { CategoriaInput } from "../../productos/types";
import { actualizarCategoria, crearCategoria, eliminarCategoria } from "../api/categorias";

function useRefrescarCategorias() {
  const queryClient = useQueryClient();
  return () => {
    void queryClient.invalidateQueries({ queryKey: ["categorias"] });
    void queryClient.invalidateQueries({ queryKey: ["productos"] }); // los productos muestran su categoría
  };
}

export function useCrearCategoria() {
  const refrescar = useRefrescarCategorias();
  return useMutation({ mutationFn: crearCategoria, onSuccess: refrescar });
}

export function useActualizarCategoria() {
  const refrescar = useRefrescarCategorias();
  return useMutation({
    mutationFn: ({ id, datos }: { id: number; datos: CategoriaInput }) =>
      actualizarCategoria(id, datos),
    onSuccess: refrescar,
  });
}

export function useEliminarCategoria() {
  const refrescar = useRefrescarCategorias();
  return useMutation({ mutationFn: eliminarCategoria, onSuccess: refrescar });
}
