// Formatea un número como precio en pesos argentinos: $ 1.250,00
export const formatearPrecio = (valor: number): string =>
  new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" }).format(valor);

// Formatea una fecha ISO del backend como "23/11/2026 09:41".
export const formatearFecha = (iso: string): string =>
  new Intl.DateTimeFormat("es-AR", { dateStyle: "short", timeStyle: "short" }).format(new Date(iso));
