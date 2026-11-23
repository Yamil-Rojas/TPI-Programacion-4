import { useForm } from "@tanstack/react-form";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { handleApiError } from "../../../shared/api/handleApiError";
import { Button } from "../../../shared/ui/Button";
import { Card } from "../../../shared/ui/Card";
import { Input } from "../../../shared/ui/Input";
import { useAuthStore } from "../../../store/authStore";
import { registerRequest } from "../api/auth";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function RegisterPage() {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);
  const [errorServidor, setErrorServidor] = useState<string | null>(null);

  const form = useForm({
    defaultValues: { username: "", full_name: "", email: "", password: "" },
    onSubmit: async ({ value }) => {
      setErrorServidor(null);
      try {
        await registerRequest(value);
        // Tras registrarse iniciamos sesión automáticamente.
        await login(value.username, value.password);
        navigate("/", { replace: true });
      } catch (error) {
        setErrorServidor(handleApiError(error));
      }
    },
  });

  return (
    <div className="mx-auto mt-12 max-w-sm px-4">
      <Card>
        <h1 className="mb-4 text-xl font-semibold text-slate-800">Crear cuenta</h1>
        <form
          className="flex flex-col gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            void form.handleSubmit();
          }}
        >
          <form.Field
            name="full_name"
            validators={{
              onChange: ({ value }) => (value.trim() ? undefined : "El nombre es obligatorio"),
            }}
          >
            {(field) => (
              <Input
                etiqueta="Nombre completo"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                error={field.state.meta.isTouched ? field.state.meta.errors[0] : undefined}
              />
            )}
          </form.Field>
          <form.Field
            name="username"
            validators={{
              onChange: ({ value }) => (value.trim() ? undefined : "El usuario es obligatorio"),
            }}
          >
            {(field) => (
              <Input
                etiqueta="Usuario"
                autoComplete="username"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                error={field.state.meta.isTouched ? field.state.meta.errors[0] : undefined}
              />
            )}
          </form.Field>
          <form.Field
            name="email"
            validators={{
              onChange: ({ value }) => (EMAIL_REGEX.test(value) ? undefined : "Email inválido"),
            }}
          >
            {(field) => (
              <Input
                etiqueta="Email"
                type="email"
                autoComplete="email"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                error={field.state.meta.isTouched ? field.state.meta.errors[0] : undefined}
              />
            )}
          </form.Field>
          <form.Field
            name="password"
            validators={{
              onChange: ({ value }) =>
                value.length >= 8 ? undefined : "Mínimo 8 caracteres",
            }}
          >
            {(field) => (
              <Input
                etiqueta="Contraseña"
                type="password"
                autoComplete="new-password"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                error={field.state.meta.isTouched ? field.state.meta.errors[0] : undefined}
              />
            )}
          </form.Field>
          {errorServidor && (
            <p role="alert" className="text-sm text-red-600">
              {errorServidor}
            </p>
          )}
          <form.Subscribe selector={(s) => [s.canSubmit, s.isSubmitting] as const}>
            {([puedeEnviar, enviando]) => (
              <Button type="submit" disabled={!puedeEnviar} cargando={enviando}>
                {enviando ? "Creando cuenta..." : "Registrarme"}
              </Button>
            )}
          </form.Subscribe>
        </form>
        <p className="mt-4 text-sm text-slate-600">
          ¿Ya tenés cuenta?{" "}
          <Link to="/login" className="text-orange-600 hover:underline">
            Iniciá sesión
          </Link>
        </p>
      </Card>
    </div>
  );
}
