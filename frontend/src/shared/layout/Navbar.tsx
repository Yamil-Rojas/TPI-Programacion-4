import { Link, useNavigate } from "react-router-dom";

import { useAuthStore } from "../../store/authStore";
import { cantidadCarrito, useCartStore } from "../../store/cartStore";
import { Button } from "../ui/Button";

export function Navbar() {
  const usuario = useAuthStore((s) => s.usuario);
  const logout = useAuthStore((s) => s.logout);
  const unidades = useCartStore((s) => cantidadCarrito(s.items));
  const navigate = useNavigate();

  async function cerrarSesion() {
    await logout();
    navigate("/login", { replace: true });
  }

  return (
    <header className="border-b border-slate-200 bg-white">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-4">
          <Link to="/" className="text-lg font-bold text-orange-600">
            Food Store
          </Link>
          {usuario && (
            <Link to="/" className="text-sm text-slate-600 hover:text-slate-900">
              Catálogo
            </Link>
          )}
          {usuario?.role === "user" && (
            <Link to="/carrito" className="text-sm text-slate-600 hover:text-slate-900">
              Carrito{unidades > 0 && (
                <span className="ml-1 rounded-full bg-orange-600 px-1.5 py-0.5 text-xs text-white">
                  {unidades}
                </span>
              )}
            </Link>
          )}
          {usuario?.role === "user" && (
            <Link to="/mis-pedidos" className="text-sm text-slate-600 hover:text-slate-900">
              Mis pedidos
            </Link>
          )}
          {usuario?.role === "admin" && (
            <Link to="/admin/resumen" className="text-sm text-slate-600 hover:text-slate-900">
              Panel admin
            </Link>
          )}
        </div>
        <div className="flex items-center gap-3">
          {usuario ? (
            <>
              <span className="text-sm text-slate-700">
                {usuario.full_name}{" "}
                <span className="rounded bg-slate-100 px-1.5 py-0.5 text-xs uppercase text-slate-500">
                  {usuario.role}
                </span>
              </span>
              <Button variante="secondary" onClick={() => void cerrarSesion()}>
                Cerrar sesión
              </Button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm text-slate-600 hover:text-slate-900">
                Ingresar
              </Link>
              <Link to="/register" className="text-sm text-orange-600 hover:underline">
                Registrarme
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
