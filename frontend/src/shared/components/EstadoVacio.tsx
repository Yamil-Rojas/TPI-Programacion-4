import type { ReactNode } from "react";

interface EstadoVacioProps {
  mensaje: string;
  descripcion?: string;
  accion?: ReactNode; // por ejemplo, un botón
}

// Se muestra cuando una lista no tiene resultados.
export function EstadoVacio({ mensaje, descripcion, accion }: EstadoVacioProps) {
  return (
    <div className="flex flex-col items-center gap-2 py-12 text-center">
      <p className="text-lg font-medium text-slate-700">{mensaje}</p>
      {descripcion && <p className="text-sm text-slate-500">{descripcion}</p>}
      {accion && <div className="mt-2">{accion}</div>}
    </div>
  );
}
