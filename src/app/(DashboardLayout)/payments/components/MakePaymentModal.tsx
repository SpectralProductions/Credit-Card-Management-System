'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { PaymentMethod } from '@prisma/client';

interface Card {
  id: string;
  cardNumber: string;
  currentBalance: number;
}

interface MakePaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MakePaymentModal({
  isOpen,
  onClose,
}: MakePaymentModalProps) {
  const { data: session } = useSession();
  const [cards, setCards] = useState<Card[]>([]);
  const [selectedCard, setSelectedCard] = useState('');
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState<PaymentMethod>('CARD');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCards = async () => {
      try {
        const response = await fetch('/api/cards');
        if (!response.ok) throw new Error('Failed to fetch cards');
        
        const data = await response.json();
        setCards(data.cards);
        if (data.cards.length > 0) {
          setSelectedCard(data.cards[0].id);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      }
    };

    if (isOpen) {
      fetchCards();
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cardId: selectedCard,
          amount: parseFloat(amount),
          method,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to process payment');
      }

      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const selectedCardDetails = cards.find((card) => card.id === selectedCard);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Make Payment</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Card
            </label>
            <select
              value={selectedCard}
              onChange={(e) => setSelectedCard(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            >
              {cards.map((card) => (
                <option key={card.id} value={card.id}>
                  •••• {card.cardNumber.slice(-4)} (Balance: ${card.currentBalance.toFixed(2)})
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Amount
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="0"
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
            {selectedCardDetails && (
              <p className="mt-1 text-sm text-gray-500">
                Current Balance: ${selectedCardDetails.currentBalance.toFixed(2)}
              </p>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Payment Method
            </label>
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value as PaymentMethod)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            >
              <option value="CARD">Card</option>
              <option value="UPI">UPI</option>
              <option value="NEFT">NEFT</option>
              <option value="AUTO_DEBIT">Auto Debit</option>
            </select>
          </div>

          {error && (
            <div className="mb-4 text-sm text-red-600">{error}</div>
          )}

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 border border-gray-300 rounded-md"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Pay'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 