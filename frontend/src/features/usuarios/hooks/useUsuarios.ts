import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { activarUsuario, desactivarUsuario, listarUsuarios } from "../api/usuarios";

export function useUsuarios() {
  return useQuery({ queryKey: ["usuarios"], queryFn: listarUsuarios });
}

export function useActivarUsuario() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: activarUsuario,
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["usuarios"] }),
  });
}

export function useDesactivarUsuario() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: desactivarUsuario,
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["usuarios"] }),
  });
}
