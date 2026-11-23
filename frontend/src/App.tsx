/**
 * Raíz de la aplicación. Al montarse consulta al backend si hay sesión válida
 * (checkSession). Es el ÚNICO useEffect que llama a la API, como pide la consigna.
 */
import { useEffect } from "react";
import { BrowserRouter } from "react-router-dom";

import { AppRouter } from "./routes/AppRouter";
import { useAuthStore } from "./store/authStore";

export default function App() {
  const checkSession = useAuthStore((s) => s.checkSession);

  useEffect(() => {
    void checkSession();
  }, [checkSession]);

  return (
    <BrowserRouter>
      <AppRouter />
    </BrowserRouter>
  );
}
