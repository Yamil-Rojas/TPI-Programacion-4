/**
 * Carrito de compras (estado del CLIENTE) con Zustand + persist.
 * Vive solo en el navegador: recién al confirmar el checkout se envía al backend.
 * Se guarda una copia del nombre y precio para mostrarlos sin volver a pedirlos.
 */
import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { Producto } from "../features/productos/types";

export interface ItemCarrito {
  producto_id: number;
  nombre: string;
  precio_unitario: number;
  cantidad: number;
  stock: number; // tope de unidades que se pueden pedir
  imagen_url: string | null;
}

interface CartState {
  items: ItemCarrito[];
  agregar: (producto: Producto, cantidad?: number) => void;
  cambiarCantidad: (productoId: number, cantidad: number) => void;
  quitar: (productoId: number) => void;
  vaciar: () => void;
  total: () => number; // suma de precio × cantidad de todos los ítems
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      agregar: (producto, cantidad = 1) =>
        set((state) => {
          const existente = state.items.find((i) => i.producto_id === producto.id);
          if (existente) {
            const nueva = Math.min(existente.cantidad + cantidad, producto.stock);
            return {
              items: state.items.map((i) =>
                i.producto_id === producto.id ? { ...i, cantidad: nueva, stock: producto.stock } : i,
              ),
            };
          }
          return {
            items: [
              ...state.items,
              {
                producto_id: producto.id,
                nombre: producto.nombre,
                precio_unitario: producto.precio_base,
                cantidad: Math.min(cantidad, producto.stock),
                stock: producto.stock,
                imagen_url: producto.imagen_url,
              },
            ],
          };
        }),

      // Cantidad entre 1 y el stock; para eliminar se usa "quitar".
      cambiarCantidad: (productoId, cantidad) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.producto_id === productoId
              ? { ...i, cantidad: Math.max(1, Math.min(cantidad, i.stock)) }
              : i,
          ),
        })),

      quitar: (productoId) =>
        set((state) => ({ items: state.items.filter((i) => i.producto_id !== productoId) })),

      vaciar: () => set({ items: [] }),

      total: () => totalCarrito(get().items),
    }),
    { name: "cart-storage" },
  ),
);

// Valores derivados (se calculan, no se guardan).
export const totalCarrito = (items: ItemCarrito[]): number =>
  items.reduce((suma, i) => suma + i.precio_unitario * i.cantidad, 0);

export const cantidadCarrito = (items: ItemCarrito[]): number =>
  items.reduce((suma, i) => suma + i.cantidad, 0);
