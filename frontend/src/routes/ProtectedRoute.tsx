import { Navigate, Outlet } from "react-router-dom";

import type { Rol } from "../features/auth/types";
import { Skeleton } from "../shared/components/Skeleton";
import { useAuthStore } from "../store/authStore";

interface ProtectedRouteProps {
  /** Si se indica, solo esos roles pueden entrar. Sin rol: basta con estar logueado. */
  roles?: Rol[];
}

export function ProtectedRoute({ roles }: ProtectedRouteProps) {
  const usuario = useAuthStore((s) => s.usuario);
  const cargando = useAuthStore((s) => s.cargando);

  // Mientras checkSession no responde, no decidimos nada (evita un parpadeo al /login).
  if (cargando) {
    return (
      <div className="mx-auto max-w-md p-8">
        <Skeleton className="h-8 w-full" />
      </div>
    );
  }

  if (!usuario) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(usuario.role)) return <Navigate to="/unauthorized" replace />;

  return <Outlet />;
}
