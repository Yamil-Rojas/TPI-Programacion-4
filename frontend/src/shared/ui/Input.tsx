import type { InputHTMLAttributes } from "react";
import { useId } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  etiqueta?: string;
  error?: string; // mensaje de validación; si existe, el campo se marca en rojo
}

export function Input({ etiqueta, error, className = "", id, ...resto }: InputProps) {
  const idGenerado = useId();
  const idCampo = id ?? idGenerado;

  return (
    <div className="flex flex-col gap-1">
      {etiqueta && (
        <label htmlFor={idCampo} className="text-sm font-medium text-slate-700">
          {etiqueta}
        </label>
      )}
      <input
        id={idCampo}
        aria-invalid={error ? true : undefined}
        className={`rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 ${
          error
            ? "border-red-500 focus:ring-red-200"
            : "border-slate-300 focus:ring-orange-200"
        } ${className}`}
        {...resto}
      />
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
