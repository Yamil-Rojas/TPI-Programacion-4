import { useForm } from "@tanstack/react-form";
import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";

import { handleApiError } from "../../../shared/api/handleApiError";
import { Button } from "../../../shared/ui/Button";
import { Card } from "../../../shared/ui/Card";
import { Input } from "../../../shared/ui/Input";
import { formatearPrecio } from "../../../shared/utils";
import { useCartStore } from "../../../store/cartStore";
import { useCrearPedido } from "../hooks/usePedidos";
import type { FormaPago } from "../types";

export default function CheckoutPage() {
  const navigate = useNavigate();
  const items = useCartStore((s) => s.items);
  const vaciar = useCartStore((s) => s.vaciar);
  const total = useCartStore((s) => s.total());
  const crear = useCrearPedido();
  const [errorServidor, setErrorServidor] = useState<string | null>(null);
  const [finalizado, setFinalizado] = useState(false); // evita volver al carrito al vaciarlo

  const form = useForm({
    defaultValues: {
      forma_pago: "EFECTIVO" as FormaPago,
      direccion_entrega: "",
      notas: "",
    },
    onSubmit: async ({ value }) => {
      setErrorServidor(null);
      try {
        await crear.mutateAsync({
          items: items.map((i) => ({ producto_id: i.producto_id, cantidad: i.cantidad })),
          forma_pago: value.forma_pago,
          direccion_entrega: value.direccion_entrega.trim(),
          notas: value.notas.trim() || undefined,
        });
        setFinalizado(true);
        vaciar();
        navigate("/mis-pedidos", { replace: true });
      } catch (error) {
        // Por ejemplo: "Stock insuficiente" (409). El carrito se conserva.
        setErrorServidor(handleApiError(error));
      }
    },
  });

  if (items.length === 0 && !finalizado) return <Navigate to="/carrito" replace />;

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <h1 className="mb-4 text-xl font-semibold text-slate-800">Datos de entrega</h1>
        <form
          className="flex flex-col gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            void form.handleSubmit();
          }}
        >
          <form.Field name="forma_pago">
            {(field) => (
              <div className="flex flex-col gap-1">
                <label htmlFor="forma_pago" className="text-sm font-medium text-slate-700">
                  Forma de pago
                </label>
                <select
                  id="forma_pago"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value as FormaPago)}
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                >
                  <option value="EFECTIVO">Efectivo</option>
                  <option value="TRANSFERENCIA">Transferencia</option>
                </select>
              </div>
            )}
          </form.Field>
          <form.Field
            name="direccion_entrega"
            validators={{
              onChange: ({ value }) => {
                const largo = value.trim().length;
                if (largo < 5) return "La dirección debe tener al menos 5 caracteres";
                if (largo > 200) return "La dirección no puede superar los 200 caracteres";
                return undefined;
              },
            }}
          >
            {(field) => (
              <Input
                etiqueta="Dirección de entrega"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                error={field.state.meta.isTouched ? field.state.meta.errors[0] : undefined}
              />
            )}
          </form.Field>
          <form.Field name="notas">
            {(field) => (
              <Input
                etiqueta="Notas (opcional)"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
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
                {enviando ? "Confirmando..." : "Confirmar pedido"}
              </Button>
            )}
          </form.Subscribe>
        </form>
      </Card>

      <Card>
        <h2 className="mb-3 text-lg font-semibold text-slate-800">Resumen</h2>
        <ul className="divide-y divide-slate-100 text-sm">
          {items.map((i) => (
            <li key={i.producto_id} className="flex justify-between py-2">
              <span>
                {i.cantidad} × {i.nombre}
              </span>
              <span>{formatearPrecio(i.precio_unitario * i.cantidad)}</span>
            </li>
          ))}
        </ul>
        <p className="mt-3 flex justify-between text-lg font-semibold text-slate-800">
          <span>Total</span>
          <span>{formatearPrecio(total)}</span>
        </p>
        <Link to="/carrito" className="mt-3 inline-block text-sm text-orange-600 hover:underline">
          Volver al carrito
        </Link>
      </Card>
    </div>
  );
}
