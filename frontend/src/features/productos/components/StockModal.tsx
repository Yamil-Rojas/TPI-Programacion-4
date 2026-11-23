import { useForm } from "@tanstack/react-form";
import { useState } from "react";

import { handleApiError } from "../../../shared/api/handleApiError";
import { Button } from "../../../shared/ui/Button";
import { Input } from "../../../shared/ui/Input";
import { Modal } from "../../../shared/ui/Modal";
import { useActualizarStock } from "../hooks/useProductosAdmin";
import type { Producto } from "../types";

interface Props {
  producto: Producto | null; // el modal está abierto cuando hay un producto
  onCerrar: () => void;
}

// Cambio rápido de stock y disponibilidad (PATCH /productos/{id}/stock).
export function StockModal({ producto, onCerrar }: Props) {
  return (
    <Modal
      abierto={producto !== null}
      onCerrar={onCerrar}
      titulo={`Stock: ${producto?.nombre ?? ""}`}
    >
      {producto && <Formulario producto={producto} onCerrar={onCerrar} />}
    </Modal>
  );
}

function Formulario({ producto, onCerrar }: { producto: Producto; onCerrar: () => void }) {
  const actualizar = useActualizarStock();
  const [errorServidor, setErrorServidor] = useState<string | null>(null);

  const form = useForm({
    defaultValues: { stock: String(producto.stock), disponible: producto.disponible },
    onSubmit: async ({ value }) => {
      setErrorServidor(null);
      try {
        await actualizar.mutateAsync({
          id: producto.id,
          datos: { stock: Number(value.stock), disponible: value.disponible },
        });
        onCerrar();
      } catch (error) {
        setErrorServidor(handleApiError(error));
      }
    },
  });

  return (
    <form
      className="flex flex-col gap-3"
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        void form.handleSubmit();
      }}
    >
      <form.Field
        name="stock"
        validators={{
          onChange: ({ value }) => {
            const n = Number(value);
            return value.trim() !== "" && Number.isInteger(n) && n >= 0
              ? undefined
              : "El stock debe ser un entero (0 o más)";
          },
        }}
      >
        {(field) => (
          <Input
            etiqueta="Stock"
            type="number"
            min="0"
            step="1"
            value={field.state.value}
            onChange={(e) => field.handleChange(e.target.value)}
            error={
              typeof field.state.meta.errors[0] === "string" ? field.state.meta.errors[0] : undefined
            }
          />
        )}
      </form.Field>
      <form.Field name="disponible">
        {(field) => (
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={field.state.value}
              onChange={(e) => field.handleChange(e.target.checked)}
            />
            Disponible para la venta
          </label>
        )}
      </form.Field>
      {errorServidor && (
        <p role="alert" className="text-sm text-red-600">
          {errorServidor}
        </p>
      )}
      <div className="flex justify-end gap-2">
        <Button variante="secondary" onClick={onCerrar}>
          Cancelar
        </Button>
        <form.Subscribe selector={(s) => [s.canSubmit, s.isSubmitting] as const}>
          {([puedeEnviar, enviando]) => (
            <Button type="submit" disabled={!puedeEnviar} cargando={enviando}>
              Guardar
            </Button>
          )}
        </form.Subscribe>
      </div>
    </form>
  );
}
