import { handleApiError } from "../../../shared/api/handleApiError";
import { EstadoError } from "../../../shared/components/EstadoError";
import { Skeleton } from "../../../shared/components/Skeleton";
import { Card } from "../../../shared/ui/Card";
import { formatearPrecio } from "../../../shared/utils";
import { useResumen } from "../hooks/usePedidos";

function Metrica({ titulo, valor, color }: { titulo: string; valor: string | number; color: string }) {
  return (
    <Card>
      <p className="text-sm text-slate-500">{titulo}</p>
      <p className={`mt-1 text-3xl font-bold ${color}`}>{valor}</p>
    </Card>
  );
}

export default function ResumenAdminPage() {
  const resumen = useResumen();

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold text-slate-800">Resumen</h1>
      {resumen.isPending ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }, (_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      ) : resumen.isError ? (
        <EstadoError
          mensaje={handleApiError(resumen.error)}
          onReintentar={() => void resumen.refetch()}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Metrica titulo="Pedidos pendientes" valor={resumen.data.pendientes} color="text-amber-600" />
          <Metrica titulo="En preparación" valor={resumen.data.en_preparacion} color="text-blue-600" />
          <Metrica titulo="Entregados" valor={resumen.data.entregados} color="text-green-600" />
          <Metrica titulo="Cancelados" valor={resumen.data.cancelados} color="text-red-600" />
          <Metrica titulo="Pedidos de hoy" valor={resumen.data.pedidos_hoy} color="text-slate-800" />
          <Metrica
            titulo="Ingresos (entregados)"
            valor={formatearPrecio(resumen.data.ingresos_entregados)}
            color="text-orange-600"
          />
        </div>
      )}
    </div>
  );
}
