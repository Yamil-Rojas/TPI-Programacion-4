import { Navigate, Route, Routes } from "react-router-dom";

import CarritoPage from "../features/carrito/pages/CarritoPage";
import LoginPage from "../features/auth/pages/LoginPage";
import RegisterPage from "../features/auth/pages/RegisterPage";
import UnauthorizedPage from "../features/auth/pages/UnauthorizedPage";
import CatalogoPage from "../features/productos/pages/CatalogoPage";
import { PaginaProvisoria } from "../shared/components/PaginaProvisoria";
import { MainLayout } from "../shared/layout/MainLayout";
import { ProtectedRoute } from "./ProtectedRoute";

/**
 * Tabla de rutas de la consigna:
 *  públicas:  /login, /register
 *  cliente:   /, /carrito, /checkout, /mis-pedidos, /mis-pedidos/:id   (role user)
 *  admin:     /admin/productos, /admin/categorias, /admin/pedidos, /admin/usuarios, /admin/resumen
 */
export function AppRouter() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        {/* Públicas */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />

        {/* Cualquier usuario logueado: el catálogo */}
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<CatalogoPage />} />
        </Route>

        {/* Solo clientes */}
        <Route element={<ProtectedRoute roles={["user"]} />}>
          <Route path="/carrito" element={<CarritoPage />} />
          <Route path="/checkout" element={<PaginaProvisoria titulo="Checkout" etapa={9} />} />
          <Route path="/mis-pedidos" element={<PaginaProvisoria titulo="Mis pedidos" etapa={9} />} />
          <Route
            path="/mis-pedidos/:id"
            element={<PaginaProvisoria titulo="Detalle del pedido" etapa={9} />}
          />
        </Route>

        {/* Solo administradores */}
        <Route element={<ProtectedRoute roles={["admin"]} />}>
          <Route path="/admin/productos" element={<PaginaProvisoria titulo="Productos" etapa={10} />} />
          <Route path="/admin/categorias" element={<PaginaProvisoria titulo="Categorías" etapa={10} />} />
          <Route path="/admin/pedidos" element={<PaginaProvisoria titulo="Pedidos" etapa={11} />} />
          <Route path="/admin/usuarios" element={<PaginaProvisoria titulo="Usuarios" etapa={11} />} />
          <Route path="/admin/resumen" element={<PaginaProvisoria titulo="Resumen" etapa={11} />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
