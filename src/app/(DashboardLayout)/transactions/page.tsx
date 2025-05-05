'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import TransactionList from './components/TransactionList';
import TransactionFilters from './components/TransactionFilters';
import { TransactionStatus } from '@prisma/client';

export default function TransactionsPage() {
  const { data: session } = useSession();
  const [filters, setFilters] = useState({
    startDate: null,
    endDate: null,
    status: null as TransactionStatus | null,
    minAmount: '',
    maxAmount: '',
    merchant: '',
  });

  if (!session?.user) {
    return <div>Please sign in to view transactions</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Transactions</h1>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <TransactionFilters filters={filters} onFilterChange={setFilters} />
          <TransactionList filters={filters} />
        </div>
      </div>
    </div>
  );
} 