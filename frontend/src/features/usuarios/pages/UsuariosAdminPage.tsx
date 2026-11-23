import type { ColumnDef } from "@tanstack/react-table";
import { useState } from "react";

import { handleApiError } from "../../../shared/api/handleApiError";
import { DataTable } from "../../../shared/components/DataTable";
import { EstadoError } from "../../../shared/components/EstadoError";
import { EstadoVacio } from "../../../shared/components/EstadoVacio";
import { Skeleton } from "../../../shared/components/Skeleton";
import { Button } from "../../../shared/ui/Button";
import { ConfirmModal } from "../../../shared/ui/ConfirmModal";
import { formatearFecha } from "../../../shared/utils";
import { useAuthStore } from "../../../store/authStore";
import type { Usuario } from "../../auth/types";
import { useActivarUsuario, useDesactivarUsuario, useUsuarios } from "../hooks/useUsuarios";

export default function UsuariosAdminPage() {
  const miId = useAuthStore((s) => s.usuario?.id);
  const usuarios = useUsuarios();
  const activar = useActivarUsuario();
  const desactivar = useDesactivarUsuario();

  const [aDesactivar, setADesactivar] = useState<Usuario | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function alternar(u: Usuario) {
    setError(null);
    try {
      await activar.mutateAsync(u.id);
    } catch (e) {
      setError(handleApiError(e));
    }
  }

  async function confirmarDesactivar() {
    if (!aDesactivar) return;
    try {
      await desactivar.mutateAsync(aDesactivar.id);
      setADesactivar(null);
    } catch (e) {
      setError(handleApiError(e));
    }
  }

  const columnas: ColumnDef<Usuario>[] = [
    { header: "Usuario", accessorFn: (u) => u.username },
    { header: "Nombre", accessorFn: (u) => u.full_name },
    { header: "Email", accessorFn: (u) => u.email },
    { header: "Rol", accessorFn: (u) => (u.role === "admin" ? "Administrador" : "Cliente") },
    { header: "Alta", accessorFn: (u) => formatearFecha(u.created_at) },
    {
      header: "Estado",
      cell: ({ row }) =>
        row.original.disabled ? (
          <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs text-red-800">Desactivado</span>
        ) : (
          <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-800">Activo</span>
        ),
    },
    {
      header: "Acciones",
      cell: ({ row }) => {
        const u = row.original;
        if (u.id === miId) return <span className="text-xs text-slate-400">Tu cuenta</span>;
        return u.disabled ? (
          <Button variante="secondary" onClick={() => void alternar(u)}>
            Activar
          </Button>
        ) : (
          <Button
            variante="danger"
            onClick={() => {
              setError(null);
              setADesactivar(u);
            }}
          >
            Desactivar
          </Button>
        );
      },
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold text-slate-800">Usuarios</h1>
      {error && !aDesactivar && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}
      {usuarios.isPending ? (
        <Skeleton className="h-48" />
      ) : usuarios.isError ? (
        <EstadoError
          mensaje={handleApiError(usuarios.error)}
          onReintentar={() => void usuarios.refetch()}
        />
      ) : usuarios.data.length === 0 ? (
        <EstadoVacio mensaje="No hay usuarios" />
      ) : (
        <DataTable data={usuarios.data} columns={columnas} />
      )}
      <ConfirmModal
        abierto={aDesactivar !== null}
        titulo="Desactivar usuario"
        mensaje={`¿Desactivar a "${aDesactivar?.username ?? ""}"? No va a poder iniciar sesión hasta que lo actives de nuevo.`}
        textoConfirmar="Sí, desactivar"
        cargando={desactivar.isPending}
        error={error}
        onConfirmar={() => void confirmarDesactivar()}
        onCerrar={() => setADesactivar(null)}
      />
    </div>
  );
}
