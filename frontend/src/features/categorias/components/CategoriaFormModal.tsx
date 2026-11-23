import { useForm } from "@tanstack/react-form";
import { useState } from "react";

import { handleApiError } from "../../../shared/api/handleApiError";
import { Button } from "../../../shared/ui/Button";
import { Input } from "../../../shared/ui/Input";
import { Modal } from "../../../shared/ui/Modal";
import type { Categoria } from "../../productos/types";
import { useActualizarCategoria, useCrearCategoria } from "../hooks/useCategoriasAdmin";

interface Props {
  abierto: boolean;
  categoria: Categoria | null; // null = alta, con valor = edición
  onCerrar: () => void;
}

export function CategoriaFormModal({ abierto, categoria, onCerrar }: Props) {
  return (
    <Modal
      abierto={abierto}
      onCerrar={onCerrar}
      titulo={categoria ? "Editar categoría" : "Nueva categoría"}
    >
      {/* El formulario se monta solo con el modal abierto: siempre arranca limpio. */}
      <Formulario categoria={categoria} onCerrar={onCerrar} />
    </Modal>
  );
}

function Formulario({ categoria, onCerrar }: Pick<Props, "categoria" | "onCerrar">) {
  const crear = useCrearCategoria();
  const actualizar = useActualizarCategoria();
  const [errorServidor, setErrorServidor] = useState<string | null>(null);

  const form = useForm({
    defaultValues: {
      nombre: categoria?.nombre ?? "",
      descripcion: categoria?.descripcion ?? "",
    },
    onSubmit: async ({ value }) => {
      setErrorServidor(null);
      const datos = { nombre: value.nombre.trim(), descripcion: value.descripcion.trim() || null };
      try {
        if (categoria) await actualizar.mutateAsync({ id: categoria.id, datos });
        else await crear.mutateAsync(datos);
        onCerrar();
      } catch (error) {
        setErrorServidor(handleApiError(error)); // por ejemplo: nombre duplicado (409)
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
        name="nombre"
        validators={{
          onChange: ({ value }) => {
            const largo = value.trim().length;
            if (largo < 2) return "El nombre debe tener al menos 2 caracteres";
            if (largo > 100) return "El nombre no puede superar los 100 caracteres";
            return undefined;
          },
        }}
      >
        {(field) => (
          <Input
            etiqueta="Nombre"
            value={field.state.value}
            onChange={(e) => field.handleChange(e.target.value)}
            onBlur={field.handleBlur}
            error={field.state.meta.isTouched ? field.state.meta.errors[0] : undefined}
          />
        )}
      </form.Field>
      <form.Field name="descripcion">
        {(field) => (
          <Input
            etiqueta="Descripción (opcional)"
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
      <div className="flex justify-end gap-2">
        <Button variante="secondary" onClick={onCerrar}>
          Cancelar
        </Button>
        <form.Subscribe selector={(s) => [s.canSubmit, s.isSubmitting] as const}>
          {([puedeEnviar, enviando]) => (
            <Button type="submit" disabled={!puedeEnviar} cargando={enviando}>
              {categoria ? "Guardar cambios" : "Crear categoría"}
            </Button>
          )}
        </form.Subscribe>
      </div>
    </form>
  );
}
