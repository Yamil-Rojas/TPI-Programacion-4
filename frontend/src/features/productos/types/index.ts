// Tipos del catálogo (mismos nombres de campo que los schemas del backend).

export interface Categoria {
  id: number;
  nombre: string;
  descripcion: string | null;
  activo: boolean;
}

export interface Producto {
  id: number;
  categoria_id: number;
  nombre: string;
  descripcion: string | null;
  precio_base: number;
  imagen_url: string | null;
  stock: number;
  disponible: boolean;
  activo: boolean;
  categoria: Categoria | null;
}

// Respuesta de GET /productos
export interface ProductosPaginados {
  total: number;
  items: Producto[];
}

// Parámetros de filtro de GET /productos
export interface FiltrosProductos {
  skip: number;
  limit: number;
  search?: string;
  categoria_id?: number;
  disponible?: boolean;
}
