/** Mutaciones de productos (admin). Al terminar, se refresca el listado. */
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { actualizarProducto, actualizarStock, crearProducto, eliminarProducto } from "../api/productos";
import type { ProductoInput, StockInput } from "../types";

function useRefrescarProductos() {
  const queryClient = useQueryClient();
  return () => void queryClient.invalidateQueries({ queryKey: ["productos"] });
}

export function useCrearProducto() {
  const refrescar = useRefrescarProductos();
  return useMutation({ mutationFn: crearProducto, onSuccess: refrescar });
}

export function useActualizarProducto() {
  const refrescar = useRefrescarProductos();
  return useMutation({
    mutationFn: ({ id, datos }: { id: number; datos: ProductoInput }) =>
      actualizarProducto(id, datos),
    onSuccess: refrescar,
  });
}

export function useActualizarStock() {
  const refrescar = useRefrescarProductos();
  return useMutation({
    mutationFn: ({ id, datos }: { id: number; datos: StockInput }) => actualizarStock(id, datos),
    onSuccess: refrescar,
  });
}

export function useEliminarProducto() {
  const refrescar = useRefrescarProductos();
  return useMutation({ mutationFn: eliminarProducto, onSuccess: refrescar });
}
