'use client';

import { useState } from 'react';
import { TransactionStatus } from '@prisma/client';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

interface TransactionFiltersProps {
  filters: {
    startDate: Date | null;
    endDate: Date | null;
    status: TransactionStatus | null;
    minAmount: string;
    maxAmount: string;
    merchant: string;
  };
  onFilterChange: (filters: TransactionFiltersProps['filters']) => void;
}

export default function TransactionFilters({
  filters,
  onFilterChange,
}: TransactionFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleInputChange = (
    field: keyof TransactionFiltersProps['filters'],
    value: any
  ) => {
    onFilterChange({
      ...filters,
      [field]: value,
    });
  };

  return (
    <div className="mb-6">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
      >
        <svg
          className={`w-5 h-5 mr-2 transform transition-transform ${
            isExpanded ? 'rotate-180' : ''
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
        Filters
      </button>

      {isExpanded && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <DatePicker
              selected={filters.startDate}
              onChange={(date) => handleInputChange('startDate', date)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholderText="Select start date"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Date
            </label>
            <DatePicker
              selected={filters.endDate}
              onChange={(date) => handleInputChange('endDate', date)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholderText="Select end date"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={filters.status || ''}
              onChange={(e) =>
                handleInputChange(
                  'status',
                  e.target.value ? (e.target.value as TransactionStatus) : null
                )
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="">All</option>
              <option value="SUCCESS">Success</option>
              <option value="FAILED">Failed</option>
              <option value="PENDING">Pending</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Min Amount
            </label>
            <input
              type="number"
              value={filters.minAmount}
              onChange={(e) => handleInputChange('minAmount', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Min amount"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Max Amount
            </label>
            <input
              type="number"
              value={filters.maxAmount}
              onChange={(e) => handleInputChange('maxAmount', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Max amount"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Merchant
            </label>
            <input
              type="text"
              value={filters.merchant}
              onChange={(e) => handleInputChange('merchant', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Search by merchant"
            />
          </div>
        </div>
      )}
    </div>
  );
} 