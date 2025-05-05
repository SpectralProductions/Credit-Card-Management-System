'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import RewardsList from './components/RewardsList';
import RedeemPointsModal from './components/RedeemPointsModal';

export default function RewardsPage() {
  const { data: session } = useSession();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReward, setSelectedReward] = useState<string | null>(null);

  if (!session?.user) {
    return <div>Please sign in to view rewards</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Rewards</h1>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <RewardsList
            onRedeem={(rewardId) => {
              setSelectedReward(rewardId);
              setIsModalOpen(true);
            }}
          />
        </div>
      </div>

      {selectedReward && (
        <RedeemPointsModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedReward(null);
          }}
          rewardId={selectedReward}
        />
      )}
    </div>
  );
} 