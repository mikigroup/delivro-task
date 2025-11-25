'use client';

import { useState, useEffect } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  flexRender,
  createColumnHelper,
} from '@tanstack/react-table';
import { History, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import type { ShipmentWithLatestInvoice } from '@/types/database';
import PriceHistoryModal from './PriceHistoryModal';

interface ShipmentsTableProps {
  companyId: string | null;
}

const columnHelper = createColumnHelper<ShipmentWithLatestInvoice>();

// Barvy pro jednotlivé dopravce
const getProviderColors = (provider: string) => {
  const colors: Record<string, { bg: string; text: string }> = {
    GLS: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
    DPD: { bg: 'bg-red-100', text: 'text-red-800' },
    UPS: { bg: 'bg-amber-100', text: 'text-amber-800' },
    PPL: { bg: 'bg-blue-100', text: 'text-blue-800' },
    FedEx: { bg: 'bg-purple-100', text: 'text-purple-800' },
  };
  return colors[provider] || { bg: 'bg-gray-100', text: 'text-gray-800' };
};

export default function ShipmentsTable({ companyId }: ShipmentsTableProps) {
  const [data, setData] = useState<ShipmentWithLatestInvoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0,
  });
  const [selectedShipment, setSelectedShipment] = useState<{
    id: string;
    trackingNumber: string;
  } | null>(null);

  const fetchShipments = async (page: number = 1) => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
      });

      if (companyId) {
        params.append('company_id', companyId);
      }

      const response = await fetch(`/api/shipments?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Chyba při načítání zásilek');
      }

      const result = await response.json();
      setData(result.data || []);
      setPagination(result.pagination || pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Chyba při načítání zásilek');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchShipments(1);
  }, [companyId]);

  const columns = [
    columnHelper.accessor('tracking_number', {
      header: 'Tracking Number',
      cell: (info) => (
        <span className="font-mono text-sm">{info.getValue()}</span>
      ),
    }),
    columnHelper.accessor('company.name', {
      header: 'Společnost',
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor('provider', {
      header: 'Dopravce',
      cell: (info) => {
        const provider = info.getValue();
        const colors = getProviderColors(provider);
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors.bg} ${colors.text}`}>
            {provider}
          </span>
        );
      },
    }),
    columnHelper.accessor('mode', {
      header: 'Režim',
      cell: (info) => (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            info.getValue() === 'EXPORT'
              ? 'bg-green-100 text-green-800'
              : 'bg-orange-100 text-orange-800'
          }`}
        >
          {info.getValue()}
        </span>
      ),
    }),
    columnHelper.accessor('origin_country', {
      header: 'Země',
      cell: (info) => (
        <span className="text-sm">
          {info.row.original.origin_country} → {info.row.original.destination_country}
        </span>
      ),
    }),
    columnHelper.accessor('latest_invoice.invoiced_weight', {
      header: 'Váha (kg)',
      cell: (info) => {
        const weight = info.getValue();
        return weight ? Number(weight).toFixed(2) : '-';
      },
    }),
    columnHelper.accessor('latest_invoice.invoiced_price', {
      header: 'Cena (CZK)',
      cell: (info) => {
        const price = info.getValue();
        return price ? Number(price).toLocaleString('cs-CZ') : '-';
      },
    }),
    columnHelper.display({
      id: 'actions',
      header: 'Akce',
      cell: (info) => (
        <button
          onClick={() =>
            setSelectedShipment({
              id: info.row.original.id,
              trackingNumber: info.row.original.tracking_number,
            })
          }
          className="flex items-center gap-1 px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded"
        >
          <History size={16} />
          Historie
        </button>
      ),
    }),
  ];

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: true,
    pageCount: pagination.totalPages,
    state: {
      pagination: {
        pageIndex: pagination.page - 1,
        pageSize: pagination.limit,
      },
    },
    onPaginationChange: (updater) => {
      const newPagination =
        typeof updater === 'function'
          ? updater({
              pageIndex: pagination.page - 1,
              pageSize: pagination.limit,
            })
          : updater;
      fetchShipments(newPagination.pageIndex + 1);
    },
  });

  if (isLoading && data.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="animate-spin text-blue-600" size={32} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
        {error}
      </div>
    );
  }

  // Získat unikátní dopravce z dat pro legendu
  const uniqueProviders = Array.from(new Set(data.map(item => item.provider))).sort();

  return (
    <>
      {/* Legenda dopravců */}
      {uniqueProviders.length > 0 && (
        <div className="mb-4 p-4 bg-white border rounded-lg shadow-sm">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Legenda dopravců:</h3>
          <div className="flex flex-wrap gap-3">
            {['GLS', 'DPD', 'UPS', 'PPL', 'FedEx'].map((provider) => {
              const colors = getProviderColors(provider);
              return (
                <div key={provider} className="flex items-center gap-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors.bg} ${colors.text}`}>
                    {provider}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

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

        {data.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            Žádné zásilky k zobrazení
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 0 && (
          <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-t">
            <div className="text-sm text-gray-700">
              Zobrazeno {pagination.page * pagination.limit - pagination.limit + 1} -{' '}
              {Math.min(pagination.page * pagination.limit, pagination.total)} z{' '}
              {pagination.total} zásilek
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => fetchShipments(pagination.page - 1)}
                disabled={pagination.page === 1 || isLoading}
                className="p-2 text-gray-600 hover:bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={20} />
              </button>
              <span className="text-sm text-gray-700">
                Strana {pagination.page} z {pagination.totalPages}
              </span>
              <button
                onClick={() => fetchShipments(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages || isLoading}
                className="p-2 text-gray-600 hover:bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Price History Modal */}
      {selectedShipment && (
        <PriceHistoryModal
          isOpen={!!selectedShipment}
          onClose={() => setSelectedShipment(null)}
          shipmentId={selectedShipment.id}
          trackingNumber={selectedShipment.trackingNumber}
        />
      )}
    </>
  );
}

