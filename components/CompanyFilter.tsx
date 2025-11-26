'use client';

import { useEffect, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { Company } from '@/types/database';

interface CompanyFilterProps {
  selectedCompanyId: string | null;
  onCompanyChange: (companyId: string | null) => void;
}

export default function CompanyFilter({ selectedCompanyId, onCompanyChange }: CompanyFilterProps) {
  const t = useTranslations();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const response = await fetch('/api/companies');
        if (response.ok) {
          const data = await response.json();
          setCompanies(data.data || []);
        }
      } catch (error) {
        console.error('Error fetching companies:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCompanies();
  }, []);

  const selectedCompany = companies.find((c) => c.id === selectedCompanyId);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <span className="text-sm font-medium text-gray-700">
          {selectedCompany ? selectedCompany.name : t('companyFilter.allCompanies')}
        </span>
        <ChevronDown size={16} className="text-gray-500" />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute z-20 mt-1 w-64 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {isLoading ? (
              <div className="px-4 py-2 text-sm text-gray-500">{t('common.loading')}</div>
            ) : (
              <>
                <button
                  onClick={() => {
                    onCompanyChange(null);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
                    !selectedCompanyId ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                  }`}
                >
                  {t('companyFilter.allCompanies')}
                </button>
                {companies.map((company) => (
                  <button
                    key={company.id}
                    onClick={() => {
                      onCompanyChange(company.id);
                      setIsOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
                      selectedCompanyId === company.id
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-700'
                    }`}
                  >
                    {company.name}
                  </button>
                ))}
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}

