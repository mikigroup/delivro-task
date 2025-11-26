'use client';

import { useState } from 'react';
import { Search, X } from 'lucide-react';

interface TrackingNumberSearchProps {
  value: string;
  onChange: (value: string) => void;
}

export default function TrackingNumberSearch({ value, onChange }: TrackingNumberSearchProps) {
  const [inputValue, setInputValue] = useState(value);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onChange(inputValue.trim());
  };

  const handleClear = () => {
    setInputValue('');
    onChange('');
  };

  return (
    <form onSubmit={handleSubmit} className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Vyhledat podle tracking number..."
          className="pl-10 pr-10 py-2 w-80 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        {inputValue && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X size={18} />
          </button>
        )}
      </div>
    </form>
  );
}

