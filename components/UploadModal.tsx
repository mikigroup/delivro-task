'use client';

import { useState, useRef } from 'react';
import { X, Upload, FileText } from 'lucide-react';
import { useTranslations } from 'next-intl';
import PreviewTable from './PreviewTable';
import type { InvoiceInput } from '@/types/database';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess: () => void;
}

export default function UploadModal({ isOpen, onClose, onUploadSuccess }: UploadModalProps) {
  const t = useTranslations();
  const [file, setFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<InvoiceInput[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const validateInvoiceData = (invoice: any, index: number): string | null => {
    const errors: string[] = [];
    const indexNum = index + 1;

    if (!invoice.id) {
      errors.push(t('validation.missingInvoiceId', { index: indexNum }));
    }

    if (!invoice.shipment) {
      errors.push(t('validation.missingShipment', { index: indexNum }));
      return errors.join('; ');
    }

    if (!invoice.shipment.id) {
      errors.push(t('validation.missingShipmentId', { index: indexNum }));
    }

    if (!invoice.shipment.trackingNumber) {
      errors.push(t('validation.missingTrackingNumber', { index: indexNum }));
    }

    if (!invoice.shipment.company) {
      errors.push(t('validation.missingCompany', { index: indexNum }));
    } else {
      if (!invoice.shipment.company.id) {
        errors.push(t('validation.missingCompanyId', { index: indexNum }));
      }
      if (!invoice.shipment.company.name) {
        errors.push(t('validation.missingCompanyName', { index: indexNum }));
      }
    }

    if (!invoice.shipment.provider) {
      errors.push(t('validation.missingProvider', { index: indexNum }));
    } else if (!['GLS', 'DPD', 'UPS', 'PPL', 'FedEx'].includes(invoice.shipment.provider)) {
      errors.push(t('validation.invalidProvider', { index: indexNum, provider: invoice.shipment.provider }));
    }

    if (!invoice.shipment.mode) {
      errors.push(t('validation.missingMode', { index: indexNum }));
    } else if (!['EXPORT', 'IMPORT'].includes(invoice.shipment.mode)) {
      errors.push(t('validation.invalidMode', { index: indexNum, mode: invoice.shipment.mode }));
    }

    if (!invoice.shipment.originCountry) {
      errors.push(t('validation.missingOriginCountry', { index: indexNum }));
    }

    if (!invoice.shipment.destinationCountry) {
      errors.push(t('validation.missingDestinationCountry', { index: indexNum }));
    }

    if (typeof invoice.invoicedWeight !== 'number' || isNaN(invoice.invoicedWeight)) {
      errors.push(t('validation.invalidWeight', { index: indexNum }));
    } else if (invoice.invoicedWeight <= 0) {
      errors.push(t('validation.weightMustBePositive', { index: indexNum }));
    }

    if (typeof invoice.invoicedPrice !== 'number' || isNaN(invoice.invoicedPrice)) {
      errors.push(t('validation.invalidPrice', { index: indexNum }));
    } else if (invoice.invoicedPrice < 0) {
      errors.push(t('validation.priceCannotBeNegative', { index: indexNum }));
    }

    return errors.length > 0 ? errors.join('; ') : null;
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.name.endsWith('.json')) {
      setError(t('uploadModal.errors.invalidFile'));
      setFile(null);
      setPreviewData([]);
      return;
    }

    const maxSize = 50 * 1024 * 1024;
    if (selectedFile.size > maxSize) {
      setError(t('uploadModal.errors.fileTooLarge', { size: (selectedFile.size / 1024 / 1024).toFixed(2) }));
      setFile(null);
      setPreviewData([]);
      return;
    }

    if (selectedFile.size === 0) {
      setError(t('uploadModal.errors.emptyFile'));
      setFile(null);
      setPreviewData([]);
      return;
    }

    setFile(selectedFile);
    setError(null);

    try {
      const text = await selectedFile.text();
      
      if (!text || text.trim().length === 0) {
        setError(t('uploadModal.errors.emptyFile'));
        setFile(null);
        setPreviewData([]);
        return;
      }

      let data;
      try {
        data = JSON.parse(text);
      } catch (parseError) {
        setError(t('uploadModal.errors.invalidJson'));
        setFile(null);
        setPreviewData([]);
        return;
      }

      if (!Array.isArray(data)) {
        setError(t('uploadModal.errors.notArray'));
        setFile(null);
        setPreviewData([]);
        return;
      }

      if (data.length === 0) {
        setError(t('uploadModal.errors.emptyArray'));
        setFile(null);
        setPreviewData([]);
        return;
      }

      const validationErrors: string[] = [];
      for (let i = 0; i < data.length; i++) {
        const error = validateInvoiceData(data[i], i);
        if (error) {
          validationErrors.push(error);
        }
      }

      if (validationErrors.length > 0) {
        const errorsToShow = validationErrors.slice(0, 5);
        const errorMessage = validationErrors.length > 5
          ? `${errorsToShow.join('\n')}\n\n${t('uploadModal.errors.andMore', { count: validationErrors.length - 5 })}`
          : errorsToShow.join('\n');
        
        setError(`${t('uploadModal.errors.invalidData')}\n\n${errorMessage}`);
        setFile(null);
        setPreviewData([]);
        return;
      }

      setPreviewData(data);
    } catch (err) {
      console.error('[UPLOAD MODAL] Error loading file:', err);
      setError(err instanceof Error ? `Chyba při načítání souboru: ${err.message}` : 'Chyba při načítání JSON souboru');
      setFile(null);
      setPreviewData([]);
    }
  };

  const handleUpload = async () => {
    if (!file || previewData.length === 0) return;

    console.log('[UPLOAD FRONTEND] Starting upload...');
    console.log('[UPLOAD FRONTEND] File:', file.name, 'Size:', file.size);
    console.log('[UPLOAD FRONTEND] Invoice count:', previewData.length);

    setIsUploading(true);
    setError(null);
    setUploadProgress('Příprava dat...');

    let response: Response | null = null;

    try {
      console.log('[UPLOAD FRONTEND] Reading file...');
      setUploadProgress(t('uploadModal.loadingFile'));
      const text = await file.text();
      console.log('[UPLOAD FRONTEND] File read, length:', text.length);
      
      console.log('[UPLOAD FRONTEND] Parsing JSON...');
      setUploadProgress(t('uploadModal.processing'));
      const data = JSON.parse(text);
      console.log('[UPLOAD FRONTEND] JSON parsed, array length:', data.length);

      console.log('[UPLOAD FRONTEND] Sending request to /api/invoices/upload...');
      setUploadProgress(t('uploadModal.uploadingToDb', { count: data.length }));
      const startTime = Date.now();
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 300000);
      
      try {
        response = await fetch('/api/invoices/upload', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
          signal: controller.signal,
        });
        
        clearTimeout(timeoutId);
      } catch (fetchError) {
        clearTimeout(timeoutId);
        if (fetchError instanceof Error && fetchError.name === 'AbortError') {
          throw new Error('Upload timeout. The file might be too large or the server is slow. Please try again.');
        }
        throw fetchError;
      }

      const endTime = Date.now();
      console.log(`[UPLOAD FRONTEND] Response received after ${endTime - startTime}ms`);
      console.log('[UPLOAD FRONTEND] Response status:', response.status);
      console.log('[UPLOAD FRONTEND] Response ok:', response.ok);
      
      setUploadProgress(t('uploadModal.completing'));

      let result;
      try {
        const responseText = await response.text();
        console.log('[UPLOAD FRONTEND] Response text length:', responseText.length);
        
        if (responseText) {
          result = JSON.parse(responseText);
          console.log('[UPLOAD FRONTEND] Response parsed successfully');
        } else {
          console.warn('[UPLOAD FRONTEND] Empty response body');
          result = null;
        }
      } catch (parseError) {
        console.error('[UPLOAD FRONTEND] Error parsing response:', parseError);
        throw new Error('Chyba při parsování odpovědi ze serveru');
      }

      if (!response.ok) {
        console.error('[UPLOAD FRONTEND] Response not OK');
        console.error('[UPLOAD FRONTEND] Error data:', result);
        const errorMessage = result?.error || result?.message || `Server vrátil chybu: ${response.status}`;
        throw new Error(errorMessage);
      }

      console.log('[UPLOAD FRONTEND] Upload successful:', result);
      setUploadProgress(t('uploadModal.done'));

      setFile(null);
      setPreviewData([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress('');
        onUploadSuccess();
        onClose();
      }, 500);
    } catch (err) {
      console.error('[UPLOAD FRONTEND] Error occurred:', err);
      console.error('[UPLOAD FRONTEND] Error type:', err instanceof Error ? err.constructor.name : typeof err);
      console.error('[UPLOAD FRONTEND] Error message:', err instanceof Error ? err.message : String(err));
      console.error('[UPLOAD FRONTEND] Error stack:', err instanceof Error ? err.stack : 'No stack trace');
      
      if (response?.ok) {
        console.warn('[UPLOAD FRONTEND] Response was OK but error occurred - data might be uploaded');
        setError('Data byla pravděpodobně nahrána, ale došlo k chybě při zpracování odpovědi. Zkontrolujte dashboard.');
      } else {
        setError(err instanceof Error ? err.message : 'Chyba při nahrávání dat');
      setUploadProgress('');
      }
      
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    if (!isUploading) {
      setFile(null);
      setPreviewData([]);
      setError(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] flex flex-col m-4">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-semibold text-gray-900">Nahrát faktury</h2>
          <button
            onClick={handleClose}
            disabled={isUploading}
            className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('uploadModal.selectFile')}
            </label>
            <div className="flex items-center gap-4">
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileSelect}
                disabled={isUploading}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Upload size={20} />
                {t('uploadModal.chooseFile')}
              </label>
              {file && (
                <div className="flex items-center gap-2 text-gray-700">
                  <FileText size={20} />
                  <span className="font-medium">{file.name}</span>
                  <span className="text-sm text-gray-500">
                    ({(file.size / 1024).toFixed(2)} KB)
                  </span>
                </div>
              )}
            </div>
          </div>

          {isUploading && uploadProgress && (
            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                <div>
                  <p className="text-sm font-medium text-blue-900">{t('uploadModal.pleaseWait')}</p>
                  <p className="text-sm text-blue-700 mt-1">{uploadProgress}</p>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start gap-2">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-600" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-red-800 mb-1">{t('uploadModal.validationError')}</h4>
                  <pre className="text-sm text-red-700 whitespace-pre-wrap font-sans">{error}</pre>
                </div>
              </div>
            </div>
          )}

          {previewData.length > 0 && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {t('uploadModal.preview')} ({previewData.length} {t('previewTable.invoices')})
              </h3>
              <PreviewTable data={previewData} />
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-4 p-6 border-t">
          <button
            onClick={handleClose}
            disabled={isUploading}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50"
          >
            {t('common.cancel')}
          </button>
          <button
            onClick={handleUpload}
            disabled={!file || previewData.length === 0 || isUploading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUploading ? t('uploadModal.uploading') : t('uploadModal.confirmUpload')}
          </button>
        </div>
      </div>
    </div>
  );
}

