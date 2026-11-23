/**
 * Hooks de TanStack Query para pedidos.
 * Las mutaciones invalidan las queries afectadas: así las pantallas se
 * actualizan solas con los datos reales del servidor.
 */
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { cancelarPedido, crearPedido, listarPedidos, obtenerPedido } from "../api/pedidos";
import type { FiltrosPedidos } from "../types";

export function usePedidos(filtros: FiltrosPedidos) {
  return useQuery({
    queryKey: ["pedidos", "lista", filtros],
    queryFn: () => listarPedidos(filtros),
    placeholderData: keepPreviousData,
  });
}

export function usePedido(id: number) {
  return useQuery({
    queryKey: ["pedidos", "detalle", id],
    queryFn: () => obtenerPedido(id),
    enabled: Number.isFinite(id),
  });
}

export function useCrearPedido() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: crearPedido,
    onSuccess: () => {
      // Crear un pedido descuenta stock: se refrescan pedidos y productos.
      void queryClient.invalidateQueries({ queryKey: ["pedidos"] });
      void queryClient.invalidateQueries({ queryKey: ["productos"] });
    },
  });
}

export function useCancelarPedido() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: cancelarPedido,
    onSuccess: () => {
      // Cancelar devuelve el stock: se refrescan pedidos y productos.
      void queryClient.invalidateQueries({ queryKey: ["pedidos"] });
      void queryClient.invalidateQueries({ queryKey: ["productos"] });
    },
  });
}
