'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import PaymentList from './components/PaymentList';
import MakePaymentModal from './components/MakePaymentModal';

export default function PaymentsPage() {
  const { data: session } = useSession();
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (!session?.user) {
    return <div>Please sign in to view payments</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Payments</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Make Payment
        </button>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <PaymentList />
        </div>
      </div>

      <MakePaymentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
} 