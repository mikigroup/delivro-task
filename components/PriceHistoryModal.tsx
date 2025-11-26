'use client';

import { useEffect, useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';
import type { InvoiceHistory } from '@/types/database';

interface PriceHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  shipmentId: string;
  trackingNumber: string;
}

export default function PriceHistoryModal({
  isOpen,
  onClose,
  shipmentId,
  trackingNumber,
}: PriceHistoryModalProps) {
  const t = useTranslations();
  const locale = useLocale();
  const [invoices, setInvoices] = useState<InvoiceHistory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && shipmentId) {
      fetchHistory();
    } else {
      setInvoices([]);
      setError(null);
    }
  }, [isOpen, shipmentId]);

  const fetchHistory = async () => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('[HISTORY MODAL] Fetching history for shipment:', shipmentId);
      const response = await fetch(`/api/shipments/${shipmentId}/history`);
      
      console.log('[HISTORY MODAL] Response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('[HISTORY MODAL] Error response:', errorData);
        throw new Error(errorData.error || t('priceHistory.loadingError'));
      }

      const data = await response.json();
      console.log('[HISTORY MODAL] Received data:', data);
      setInvoices(data.invoices || []);
    } catch (err) {
      console.error('[HISTORY MODAL] Error:', err);
      setError(err instanceof Error ? err.message : t('priceHistory.loadingError'));
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col m-4">
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">{t('priceHistory.title')}</h2>
            <p className="text-sm text-gray-500 mt-1">{t('priceHistory.tracking')}: {trackingNumber}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="animate-spin text-blue-600" size={32} />
            </div>
          ) : error ? (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          ) : invoices.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              {t('priceHistory.noHistory')}
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('priceHistory.date')}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('priceHistory.weight')}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('priceHistory.price')}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {invoices.map((invoice) => (
                    <tr key={invoice.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {new Date(invoice.created_at).toLocaleString(locale === 'cs' ? 'cs-CZ' : 'en-US')}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {Number(invoice.invoiced_weight).toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {Number(invoice.invoiced_price).toLocaleString(locale === 'cs' ? 'cs-CZ' : 'en-US')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end p-6 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
          >
            {t('common.close')}
          </button>
        </div>
      </div>
    </div>
  );
}

