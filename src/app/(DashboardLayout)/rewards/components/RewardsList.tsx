'use client';

import { useEffect, useState } from 'react';
import { format } from 'date-fns';

interface Redemption {
  id: string;
  pointsUsed: number;
  description: string;
  redeemedAt: Date;
}

interface Reward {
  id: string;
  points: number;
  lastUpdated: Date;
  card: {
    cardNumber: string;
  };
  redemptions: Redemption[];
}

interface RewardsListProps {
  onRedeem: (rewardId: string) => void;
}

export default function RewardsList({ onRedeem }: RewardsListProps) {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRewards = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/rewards');
        if (!response.ok) throw new Error('Failed to fetch rewards');
        
        const data = await response.json();
        setRewards(data.rewards);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchRewards();
  }, []);

  if (loading) return <div>Loading rewards...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rewards.map((reward) => (
          <div
            key={reward.id}
            className="bg-white rounded-lg border border-gray-200 p-6"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  •••• {reward.card.cardNumber.slice(-4)}
                </h3>
                <p className="text-sm text-gray-500">
                  Last updated: {format(new Date(reward.lastUpdated), 'MMM d, yyyy')}
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-blue-600">
                  {reward.points}
                </p>
                <p className="text-sm text-gray-500">Points</p>
              </div>
            </div>

            <button
              onClick={() => onRedeem(reward.id)}
              disabled={reward.points === 0}
              className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Redeem Points
            </button>

            {reward.redemptions.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">
                  Recent Redemptions
                </h4>
                <div className="space-y-2">
                  {reward.redemptions.slice(0, 3).map((redemption) => (
                    <div
                      key={redemption.id}
                      className="text-sm text-gray-600 flex justify-between"
                    >
                      <span>{redemption.description}</span>
                      <span className="text-red-600">
                        -{redemption.pointsUsed} points
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {rewards.length === 0 && (
        <div className="text-center text-gray-500">
          No rewards found. Make purchases with your cards to earn points!
        </div>
      )}
    </div>
  );
} 