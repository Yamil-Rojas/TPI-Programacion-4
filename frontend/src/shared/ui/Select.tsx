import type { SelectHTMLAttributes } from "react";
import { useId } from "react";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  etiqueta?: string;
  error?: string;
}

export function Select({ etiqueta, error, className = "", id, children, ...resto }: SelectProps) {
  const idGenerado = useId();
  const idCampo = id ?? idGenerado;

  return (
    <div className="flex flex-col gap-1">
      {etiqueta && (
        <label htmlFor={idCampo} className="text-sm font-medium text-slate-700">
          {etiqueta}
        </label>
      )}
      <select
        id={idCampo}
        aria-invalid={error ? true : undefined}
        className={`rounded-lg border bg-white px-3 py-2 text-sm outline-none focus:ring-2 ${
          error ? "border-red-500 focus:ring-red-200" : "border-slate-300 focus:ring-orange-200"
        } ${className}`}
        {...resto}
      >
        {children}
      </select>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
