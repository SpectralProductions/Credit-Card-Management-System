'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface Card {
  id: string;
  cardNumber: string;
}

interface GenerateStatementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function GenerateStatementModal({
  isOpen,
  onClose,
}: GenerateStatementModalProps) {
  const { data: session } = useSession();
  const [cards, setCards] = useState<Card[]>([]);
  const [selectedCard, setSelectedCard] = useState('');
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
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
      const response = await fetch('/api/statements/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cardId: selectedCard,
          month,
          year,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to generate statement');
      }

      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Generate Statement</h2>
        
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
                  •••• {card.cardNumber.slice(-4)}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Month
              </label>
              <select
                value={month}
                onChange={(e) => setMonth(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Year
              </label>
              <select
                value={year}
                onChange={(e) => setYear(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              >
                {Array.from({ length: 3 }, (_, i) => year - 1 + i).map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
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
              {loading ? 'Generating...' : 'Generate'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 