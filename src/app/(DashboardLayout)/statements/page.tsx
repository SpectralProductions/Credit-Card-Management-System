'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import StatementList from './components/StatementList';
import GenerateStatementModal from './components/GenerateStatementModal';

export default function StatementsPage() {
  const { data: session } = useSession();
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (!session?.user) {
    return <div>Please sign in to view statements</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Statements</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Generate Statement
        </button>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <StatementList />
        </div>
      </div>

      <GenerateStatementModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
} 