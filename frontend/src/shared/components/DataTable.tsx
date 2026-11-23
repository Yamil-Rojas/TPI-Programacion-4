/**
 * Tabla reutilizable con TanStack Table.
 * Recibe los datos y la definición de columnas. La paginación es del lado del
 * cliente: el panel de administración pide hasta 100 registros al servidor y la
 * tabla los reparte en páginas.
 */
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import type { ColumnDef } from "@tanstack/react-table";

import { Paginacion } from "./Paginacion";

interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  tamanoPagina?: number; // filas por página (por defecto 10)
}

export function DataTable<T>({ data, columns, tamanoPagina = 10 }: DataTableProps<T>) {
  const tabla = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageIndex: 0, pageSize: tamanoPagina } },
  });

  return (
    <div className="flex flex-col gap-3">
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-500">
            {tabla.getHeaderGroups().map((grupo) => (
              <tr key={grupo.id}>
                {grupo.headers.map((h) => (
                  <th key={h.id} className="px-4 py-3 font-medium">
                    {flexRender(h.column.columnDef.header, h.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {tabla.getRowModel().rows.map((fila) => (
              <tr key={fila.id} className="border-t border-slate-100">
                {fila.getVisibleCells().map((celda) => (
                  <td key={celda.id} className="px-4 py-3">
                    {flexRender(celda.column.columnDef.cell, celda.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Paginacion
        pagina={tabla.getState().pagination.pageIndex}
        totalPaginas={tabla.getPageCount()}
        onCambiar={(p) => tabla.setPageIndex(p)}
      />
    </div>
  );
}
