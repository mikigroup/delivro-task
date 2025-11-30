'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  flexRender,
  createColumnHelper,
} from '@tanstack/react-table';
import { History, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { useTranslations, useLocale } from 'next-intl';
import type { ShipmentWithLatestInvoice } from '@/types/database';
import PriceHistoryModal from './PriceHistoryModal';

interface ShipmentsTableProps {
  companyId: string | null;
  trackingNumber?: string;
}

const columnHelper = createColumnHelper<ShipmentWithLatestInvoice>();

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

const getProviderLogo = (provider: string): string => {
  const logoMap: Record<string, string> = {
    GLS: '/assets/gls.svg',
    DPD: '/assets/dpd.svg',
    UPS: '/assets/ups.svg',
    PPL: '/assets/ppl.svg',
    FedEx: '/assets/fedex.svg',
  };
  return logoMap[provider] || '';
};

export default function ShipmentsTable({ companyId, trackingNumber }: ShipmentsTableProps) {
  const t = useTranslations();
  const locale = useLocale();
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

  const fetchShipments = useCallback(async (page: number = 1) => {
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

      if (trackingNumber && trackingNumber.trim()) {
        params.append('tracking_number', trackingNumber.trim());
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);
      
      const response = await fetch(`/api/shipments?${params.toString()}`, {
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Chyba při načítání zásilek');
      }

      const result = await response.json();
      setData(result.data || []);
      setPagination(result.pagination || pagination);
    } catch (err) {
      if (err instanceof Error) {
        if (err.name === 'AbortError') {
          setError('Request timeout. Please try again.');
        } else {
          setError(err.message || 'Chyba při načítání zásilek');
        }
      } else {
        setError('Chyba při načítání zásilek');
      }
    } finally {
      setIsLoading(false);
    }
  }, [companyId, trackingNumber, pagination.limit]);

  useEffect(() => {
    fetchShipments(1);
  }, [fetchShipments]);

  const columns = [
    columnHelper.accessor('tracking_number', {
      header: t('shipmentsTable.trackingNumber'),
      cell: (info) => (
        <span className="font-mono text-sm">{info.getValue()}</span>
      ),
    }),
    columnHelper.accessor('company.name', {
      header: t('shipmentsTable.company'),
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor('provider', {
      header: t('shipmentsTable.provider'),
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
      header: t('shipmentsTable.mode'),
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
      header: t('shipmentsTable.country'),
      cell: (info) => (
        <span className="text-sm">
          {info.row.original.origin_country} → {info.row.original.destination_country}
        </span>
      ),
    }),
    columnHelper.accessor('latest_invoice.invoiced_weight', {
      header: t('shipmentsTable.weight'),
      cell: (info) => {
        const weight = info.getValue();
        return weight ? Number(weight).toFixed(2) : '-';
      },
    }),
    columnHelper.accessor('latest_invoice.invoiced_price', {
      header: t('shipmentsTable.price'),
      cell: (info) => {
        const price = info.getValue();
        return price ? Number(price).toLocaleString(locale === 'cs' ? 'cs-CZ' : 'en-US') : '-';
      },
    }),
    columnHelper.display({
      id: 'actions',
      header: t('shipmentsTable.actions'),
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
          {t('shipmentsTable.history')}
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

  const uniqueProviders = Array.from(new Set(data.map(item => item.provider))).sort();

  return (
    <>      
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
            {t('shipmentsTable.noShipments')}
          </div>
        )}
        
        {pagination.totalPages > 0 && (
          <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-t">
            <div className="text-sm text-gray-700">
              {t('common.showing')} {pagination.page * pagination.limit - pagination.limit + 1} -{' '}
              {Math.min(pagination.page * pagination.limit, pagination.total)} {t('common.of')}{' '}
              {pagination.total} {t('shipmentsTable.shipments')}
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
                {t('common.page')} {pagination.page} {t('common.of')} {pagination.totalPages}
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

      {selectedShipment && (
        <PriceHistoryModal
          isOpen={!!selectedShipment}
          onClose={() => setSelectedShipment(null)}
          shipmentId={selectedShipment.id}
          trackingNumber={selectedShipment.trackingNumber}
        />
      )}

{uniqueProviders.length > 0 && (
        <div className="mb-4 p-4 bg-white border rounded-lg shadow-sm">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">{t('deliveryCompanies.deliveryCompanies')}</h3>
          <div className="flex flex-wrap gap-4 items-center">
            {['GLS', 'DPD', 'UPS', 'PPL', 'FedEx'].map((provider) => {
              const colors = getProviderColors(provider);
              const logoPath = getProviderLogo(provider);
              const borderColor = colors.text.replace('text-', 'border-');
              return (
                <div key={provider} className="flex flex-col items-center gap-2">
                  {logoPath && (
                    <div className="relative w-20 h-10 flex items-center justify-center">
                      <Image
                        src={logoPath}
                        alt={provider}
                        width={40}
                        height={40}
                        className="object-contain"
                        unoptimized
                      />
                    </div>
                  )}
                  <div className={`w-full h-3 rounded ${colors.bg} ${borderColor} border`} title={provider}></div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}

