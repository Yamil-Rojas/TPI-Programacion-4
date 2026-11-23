// Formatea un número como precio en pesos argentinos: $ 1.250,00
export const formatearPrecio = (valor: number): string =>
  new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" }).format(valor);
