'use client';

import { useState, useRef } from 'react';
import { X, Upload, FileText } from 'lucide-react';
import PreviewTable from './PreviewTable';
import type { InvoiceInput } from '@/types/database';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess: () => void;
}

export default function UploadModal({ isOpen, onClose, onUploadSuccess }: UploadModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<InvoiceInput[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.name.endsWith('.json')) {
      setError('Prosím vyberte JSON soubor');
      return;
    }

    setFile(selectedFile);
    setError(null);

    try {
      const text = await selectedFile.text();
      const data = JSON.parse(text);

      if (!Array.isArray(data)) {
        setError('JSON soubor musí obsahovat pole faktur');
        setFile(null);
        return;
      }

      setPreviewData(data);
    } catch (err) {
      setError('Chyba při načítání JSON souboru');
      setFile(null);
      setPreviewData([]);
    }
  };

  const handleUpload = async () => {
    if (!file || previewData.length === 0) return;

    setIsUploading(true);
    setError(null);

    try {
      const text = await file.text();
      const data = JSON.parse(text);

      const response = await fetch('/api/invoices/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Chyba při nahrávání dat');
      }

      const result = await response.json();
      console.log('Upload successful:', result);

      // Reset state
      setFile(null);
      setPreviewData([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      onUploadSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Chyba při nahrávání dat');
    } finally {
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
        {/* Header */}
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

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* File Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Vyberte JSON soubor
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
                Vybrat soubor
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

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          {/* Preview Table */}
          {previewData.length > 0 && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Náhled dat ({previewData.length} faktur)
              </h3>
              <PreviewTable data={previewData} />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-4 p-6 border-t">
          <button
            onClick={handleClose}
            disabled={isUploading}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50"
          >
            Zrušit
          </button>
          <button
            onClick={handleUpload}
            disabled={!file || previewData.length === 0 || isUploading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUploading ? 'Nahrávání...' : 'Potvrdit nahrání'}
          </button>
        </div>
      </div>
    </div>
  );
}

