import { Button } from "../ui/Button";

interface EstadoErrorProps {
  mensaje: string;
  onReintentar?: () => void;
}

// Se muestra cuando falla la carga de datos (usar con handleApiError).
export function EstadoError({ mensaje, onReintentar }: EstadoErrorProps) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center gap-3 rounded-xl border border-red-200 bg-red-50 py-8 text-center"
    >
      <p className="text-sm font-medium text-red-700">{mensaje}</p>
      {onReintentar && (
        <Button variante="secondary" onClick={onReintentar}>
          Reintentar
        </Button>
      )}
    </div>
  );
}
