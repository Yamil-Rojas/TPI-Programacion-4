/**
 * PANTALLA PROVISORIA de la Etapa 6: comprueba que el frontend se conecta con
 * el backend (URL del .env, CORS) y muestra los componentes compartidos.
 * En la Etapa 7 se reemplaza por el router (AppRouter) y checkSession.
 */
import { useQuery } from "@tanstack/react-query";

import { axiosInstance } from "./shared/api/axiosInstance";
import { handleApiError } from "./shared/api/handleApiError";
import { EstadoError } from "./shared/components/EstadoError";
import { Skeleton } from "./shared/components/Skeleton";
import { BadgeEstado } from "./shared/ui/BadgeEstado";
import { Button } from "./shared/ui/Button";
import { Card } from "./shared/ui/Card";

interface RespuestaProductos {
  total: number;
  items: Array<{ id: number; nombre: string; precio_base: number }>;
}

export default function App() {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["prueba-conexion"],
    queryFn: async () => {
      const respuesta = await axiosInstance.get<RespuestaProductos>("/productos", {
        params: { limit: 3 },
      });
      return respuesta.data;
    },
  });

  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-6 p-8">
      <h1 className="text-3xl font-bold text-orange-600">Food Store</h1>
      <p className="text-slate-600">
        Frontend base listo. Prueba de conexión con la API:
      </p>

      <Card className="flex flex-col gap-3">
        {isLoading && (
          <>
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-4 w-64" />
            <Skeleton className="h-4 w-40" />
          </>
        )}
        {isError && (
          <EstadoError mensaje={handleApiError(error)} onReintentar={() => void refetch()} />
        )}
        {data && (
          <>
            <p className="font-medium text-green-700">
              ✔ Conectado: el backend tiene {data.total} productos.
            </p>
            <ul className="list-disc pl-5 text-sm text-slate-700">
              {data.items.map((producto) => (
                <li key={producto.id}>
                  {producto.nombre} — ${producto.precio_base}
                </li>
              ))}
            </ul>
          </>
        )}
      </Card>

      <Card className="flex flex-wrap items-center gap-3">
        <BadgeEstado estado="PENDIENTE" />
        <BadgeEstado estado="EN_PREPARACION" />
        <BadgeEstado estado="ENTREGADO" />
        <BadgeEstado estado="CANCELADO" />
        <Button>Primario</Button>
        <Button variante="secondary">Secundario</Button>
        <Button variante="danger">Peligro</Button>
      </Card>
    </main>
  );
}
