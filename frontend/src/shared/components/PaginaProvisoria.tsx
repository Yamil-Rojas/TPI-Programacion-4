import { Card } from "../ui/Card";

// Marcador de las pantallas que se construyen en etapas siguientes.
export function PaginaProvisoria({ titulo, etapa }: { titulo: string; etapa: number }) {
  return (
    <Card>
      <h1 className="text-xl font-semibold text-slate-800">{titulo}</h1>
      <p className="mt-1 text-sm text-slate-500">Pantalla que se construye en la Etapa {etapa}.</p>
    </Card>
  );
}
