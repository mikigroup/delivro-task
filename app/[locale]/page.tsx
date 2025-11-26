'use client';

import { useState } from 'react';
import { Upload } from 'lucide-react';
import { useTranslations } from 'next-intl';
import UploadModal from '@/components/UploadModal';
import ShipmentsTable from '@/components/ShipmentsTable';
import CompanyFilter from '@/components/CompanyFilter';
import TrackingNumberSearch from '@/components/TrackingNumberSearch';
import LanguageSwitcher from '@/components/LanguageSwitcher';

export default function Home() {
  const t = useTranslations();
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);
  const [trackingNumber, setTrackingNumber] = useState<string>('');
  const [refreshKey, setRefreshKey] = useState(0);

  const handleUploadSuccess = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gray-50">    
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">{t('dashboard.title')}</h1>
            <div className="flex items-center gap-3">
              <LanguageSwitcher />
              <button
                onClick={() => setIsUploadModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Upload size={20} />
                {t('dashboard.uploadInvoices')}
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex items-center gap-4">
          <CompanyFilter
            selectedCompanyId={selectedCompanyId}
            onCompanyChange={setSelectedCompanyId}
          />
          <TrackingNumberSearch
            value={trackingNumber}
            onChange={setTrackingNumber}
          />
        </div>

        <div key={refreshKey}>
          <ShipmentsTable companyId={selectedCompanyId} trackingNumber={trackingNumber} />
        </div>
      </main>
    
      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUploadSuccess={handleUploadSuccess}
      />
    </div>
  );
}
