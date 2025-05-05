'use client';

import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { PaymentMethod } from '@prisma/client';

interface Payment {
  id: string;
  amount: number;
  method: PaymentMethod;
  paidAt: Date;
  card: {
    cardNumber: string;
  };
}

export default function PaymentList() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/payments');
        if (!response.ok) throw new Error('Failed to fetch payments');
        
        const data = await response.json();
        setPayments(data.payments);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, []);

  if (loading) return <div>Loading payments...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Card Number
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Amount
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Method
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Date
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {payments.map((payment) => (
            <tr key={payment.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                •••• {payment.card.cardNumber.slice(-4)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                ${payment.amount.toFixed(2)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {payment.method}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {format(new Date(payment.paidAt), 'MMM d, yyyy HH:mm')}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 