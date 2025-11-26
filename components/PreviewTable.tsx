'use client';

import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  flexRender,
  createColumnHelper,
} from '@tanstack/react-table';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';
import type { InvoiceInput } from '@/types/database';

interface PreviewTableProps {
  data: InvoiceInput[];
}

const columnHelper = createColumnHelper<InvoiceInput>();

export default function PreviewTable({ data }: PreviewTableProps) {
  const t = useTranslations();
  const locale = useLocale();
  const columns = [
    columnHelper.accessor('shipment.trackingNumber', {
      header: t('shipmentsTable.trackingNumber'),
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor('shipment.company.name', {
      header: t('previewTable.company'),
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor('shipment.provider', {
      header: t('previewTable.provider'),
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor('invoicedWeight', {
      header: t('previewTable.weight'),
      cell: (info) => info.getValue().toFixed(2),
    }),
    columnHelper.accessor('invoicedPrice', {
      header: t('previewTable.price'),
      cell: (info) => info.getValue().toLocaleString(locale === 'cs' ? 'cs-CZ' : 'en-US'),
    }),
  ];

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="hover:bg-gray-50">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-4 py-3 text-sm text-gray-900">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-t">
        <div className="text-sm text-gray-700">
          {t('common.showing')} {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} -{' '}
          {Math.min(
            (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
            data.length
          )}{' '}
          {t('common.of')} {data.length} {t('previewTable.invoices')}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="p-2 text-gray-600 hover:bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={20} />
          </button>
          <span className="text-sm text-gray-700">
            {t('common.page')} {table.getState().pagination.pageIndex + 1} {t('common.of')} {table.getPageCount()}
          </span>
          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="p-2 text-gray-600 hover:bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}

