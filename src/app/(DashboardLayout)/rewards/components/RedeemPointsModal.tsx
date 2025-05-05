'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface RedeemPointsModalProps {
  isOpen: boolean;
  onClose: () => void;
  rewardId: string;
}

interface Reward {
  id: string;
  points: number;
  card: {
    cardNumber: string;
  };
}

export default function RedeemPointsModal({
  isOpen,
  onClose,
  rewardId,
}: RedeemPointsModalProps) {
  const { data: session } = useSession();
  const [reward, setReward] = useState<Reward | null>(null);
  const [points, setPoints] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReward = async () => {
      try {
        const response = await fetch('/api/rewards');
        if (!response.ok) throw new Error('Failed to fetch reward');
        
        const data = await response.json();
        const reward = data.rewards.find((r: Reward) => r.id === rewardId);
        if (reward) {
          setReward(reward);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      }
    };

    if (isOpen && rewardId) {
      fetchReward();
    }
  }, [isOpen, rewardId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/rewards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rewardId,
          pointsToRedeem: parseInt(points),
          description,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to redeem points');
      }

      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !reward) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Redeem Points</h2>
        
        <div className="mb-4">
          <p className="text-sm text-gray-600">
            Card: •••• {reward.card.cardNumber.slice(-4)}
          </p>
          <p className="text-sm text-gray-600">
            Available Points: {reward.points}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Points to Redeem
            </label>
            <input
              type="number"
              value={points}
              onChange={(e) => setPoints(e.target.value)}
              min="1"
              max={reward.points}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Redemption Description
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="e.g., Amazon Gift Card"
              required
            />
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
              disabled={loading || !points || parseInt(points) > reward.points}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Redeem'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 