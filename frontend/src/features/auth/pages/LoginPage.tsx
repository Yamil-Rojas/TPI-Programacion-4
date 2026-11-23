import { useForm } from "@tanstack/react-form";
import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";

import { useAuthStore } from "../../../store/authStore";
import { handleApiError } from "../../../shared/api/handleApiError";
import { Button } from "../../../shared/ui/Button";
import { Card } from "../../../shared/ui/Card";
import { Input } from "../../../shared/ui/Input";

export default function LoginPage() {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);
  const usuario = useAuthStore((s) => s.usuario);
  const [errorServidor, setErrorServidor] = useState<string | null>(null);

  const form = useForm({
    defaultValues: { username: "", password: "" },
    onSubmit: async ({ value }) => {
      setErrorServidor(null);
      try {
        await login(value.username, value.password);
        const rol = useAuthStore.getState().usuario?.role;
        navigate(rol === "admin" ? "/admin/resumen" : "/", { replace: true });
      } catch (error) {
        setErrorServidor(handleApiError(error));
      }
    },
  });

  // Si ya hay sesión, no tiene sentido mostrar el login.
  if (usuario) {
    return <Navigate to={usuario.role === "admin" ? "/admin/resumen" : "/"} replace />;
  }

  return (
    <div className="mx-auto mt-16 max-w-sm px-4">
      <Card>
        <h1 className="mb-4 text-xl font-semibold text-slate-800">Iniciar sesión</h1>
        <form
          className="flex flex-col gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            void form.handleSubmit();
          }}
        >
          <form.Field
            name="username"
            validators={{
              onSubmit: ({ value }) => (value.trim() ? undefined : "Ingresá tu usuario"),
            }}
          >
            {(field) => (
              <Input
                etiqueta="Usuario"
                autoComplete="username"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                error={field.state.meta.errors[0]}
              />
            )}
          </form.Field>
          <form.Field
            name="password"
            validators={{
              onSubmit: ({ value }) => (value ? undefined : "Ingresá tu contraseña"),
            }}
          >
            {(field) => (
              <Input
                etiqueta="Contraseña"
                type="password"
                autoComplete="current-password"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                error={field.state.meta.errors[0]}
              />
            )}
          </form.Field>
          {errorServidor && (
            <p role="alert" className="text-sm text-red-600">
              {errorServidor}
            </p>
          )}
          <form.Subscribe selector={(s) => s.isSubmitting}>
            {(enviando) => (
              <Button type="submit" cargando={enviando}>
                {enviando ? "Ingresando..." : "Ingresar"}
              </Button>
            )}
          </form.Subscribe>
        </form>
        <p className="mt-4 text-sm text-slate-600">
          ¿No tenés cuenta?{" "}
          <Link to="/register" className="text-orange-600 hover:underline">
            Registrate
          </Link>
        </p>
      </Card>
    </div>
  );
}
