'use client';

import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import Link from 'next/link';

interface Statement {
  id: string;
  cardId: string;
  billingDate: Date;
  dueDate: Date;
  totalAmount: number;
  minimumDue: number;
  paid: boolean;
  card: {
    cardNumber: string;
  };
}

export default function StatementList() {
  const [statements, setStatements] = useState<Statement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStatements = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/statements');
        if (!response.ok) throw new Error('Failed to fetch statements');
        
        const data = await response.json();
        setStatements(data.statements);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchStatements();
  }, []);

  if (loading) return <div>Loading statements...</div>;
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
              Billing Date
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Due Date
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Total Amount
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Minimum Due
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {statements.map((statement) => (
            <tr key={statement.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                •••• {statement.card.cardNumber.slice(-4)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {format(new Date(statement.billingDate), 'MMM d, yyyy')}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {format(new Date(statement.dueDate), 'MMM d, yyyy')}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                ${statement.totalAmount.toFixed(2)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                ${statement.minimumDue.toFixed(2)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                  ${statement.paid ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                  {statement.paid ? 'Paid' : 'Due'}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <Link
                  href={`/api/statements/${statement.id}/download`}
                  className="text-blue-600 hover:text-blue-900"
                >
                  Download PDF
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 