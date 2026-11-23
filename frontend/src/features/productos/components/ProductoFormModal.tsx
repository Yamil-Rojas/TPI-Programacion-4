import { useForm } from "@tanstack/react-form";
import { useState } from "react";

import { handleApiError } from "../../../shared/api/handleApiError";
import { Button } from "../../../shared/ui/Button";
import { Input } from "../../../shared/ui/Input";
import { Modal } from "../../../shared/ui/Modal";
import { Select } from "../../../shared/ui/Select";
import { useCategorias } from "../hooks/useProductos";
import { useActualizarProducto, useCrearProducto } from "../hooks/useProductosAdmin";
import type { Producto } from "../types";

interface Props {
  abierto: boolean;
  producto: Producto | null; // null = alta, con valor = edición
  onCerrar: () => void;
}

export function ProductoFormModal({ abierto, producto, onCerrar }: Props) {
  return (
    <Modal abierto={abierto} onCerrar={onCerrar} titulo={producto ? "Editar producto" : "Nuevo producto"}>
      <Formulario producto={producto} onCerrar={onCerrar} />
    </Modal>
  );
}

function Formulario({ producto, onCerrar }: Pick<Props, "producto" | "onCerrar">) {
  const categorias = useCategorias();
  const crear = useCrearProducto();
  const actualizar = useActualizarProducto();
  const [errorServidor, setErrorServidor] = useState<string | null>(null);

  // Los números se guardan como texto en el formulario y se convierten al enviar.
  const form = useForm({
    defaultValues: {
      nombre: producto?.nombre ?? "",
      descripcion: producto?.descripcion ?? "",
      categoria_id: producto ? String(producto.categoria_id) : "",
      precio_base: producto ? String(producto.precio_base) : "",
      stock: producto ? String(producto.stock) : "0",
      imagen_url: producto?.imagen_url ?? "",
      disponible: producto?.disponible ?? true,
    },
    onSubmit: async ({ value }) => {
      setErrorServidor(null);
      const datos = {
        categoria_id: Number(value.categoria_id),
        nombre: value.nombre.trim(),
        descripcion: value.descripcion.trim() || null,
        precio_base: Number(value.precio_base),
        imagen_url: value.imagen_url.trim() || null,
        stock: Number(value.stock),
        disponible: value.disponible,
      };
      try {
        if (producto) await actualizar.mutateAsync({ id: producto.id, datos });
        else await crear.mutateAsync(datos);
        onCerrar();
      } catch (error) {
        setErrorServidor(handleApiError(error));
      }
    },
  });

  const visible = (meta: { isTouched: boolean; errors: unknown[] }) =>
    meta.isTouched && typeof meta.errors[0] === "string" ? meta.errors[0] : undefined;

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
        validators={{ onChange: ({ value }) => (value.trim() ? undefined : "El nombre es obligatorio") }}
      >
        {(field) => (
          <Input
            etiqueta="Nombre"
            value={field.state.value}
            onChange={(e) => field.handleChange(e.target.value)}
            onBlur={field.handleBlur}
            error={visible(field.state.meta)}
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
      <form.Field
        name="categoria_id"
        validators={{ onChange: ({ value }) => (value ? undefined : "Elegí una categoría") }}
      >
        {(field) => (
          <Select
            etiqueta="Categoría"
            value={field.state.value}
            onChange={(e) => field.handleChange(e.target.value)}
            onBlur={field.handleBlur}
            error={visible(field.state.meta)}
          >
            <option value="">Seleccionar...</option>
            {categorias.data?.map((c) => (
              <option key={c.id} value={String(c.id)}>
                {c.nombre}
              </option>
            ))}
          </Select>
        )}
      </form.Field>
      <div className="grid grid-cols-2 gap-3">
        <form.Field
          name="precio_base"
          validators={{
            onChange: ({ value }) => {
              const n = Number(value);
              return value.trim() !== "" && Number.isFinite(n) && n >= 0
                ? undefined
                : "Ingresá un precio válido (0 o más)";
            },
          }}
        >
          {(field) => (
            <Input
              etiqueta="Precio"
              type="number"
              min="0"
              step="0.01"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
              error={visible(field.state.meta)}
            />
          )}
        </form.Field>
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
              onBlur={field.handleBlur}
              error={visible(field.state.meta)}
            />
          )}
        </form.Field>
      </div>
      <form.Field name="imagen_url">
        {(field) => (
          <Input
            etiqueta="URL de la imagen (opcional)"
            value={field.state.value}
            onChange={(e) => field.handleChange(e.target.value)}
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
              {producto ? "Guardar cambios" : "Crear producto"}
            </Button>
          )}
        </form.Subscribe>
      </div>
    </form>
  );
}
