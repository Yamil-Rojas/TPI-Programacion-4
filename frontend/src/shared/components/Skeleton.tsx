// Bloque gris animado que se muestra mientras cargan los datos.
// Se le da forma con className, por ejemplo: <Skeleton className="h-4 w-32" />
export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-slate-200 ${className}`} />;
}
