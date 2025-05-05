'use client';

import { IconCreditCard } from '@tabler/icons-react';

interface LogoProps {
  className?: string;
  size?: 'small' | 'medium' | 'large';
}

export default function Logo({ className = '', size = 'medium' }: LogoProps) {
  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return 'text-xl icon-sm';
      case 'large':
        return 'text-4xl icon-lg';
      default:
        return 'text-2xl icon-md';
    }
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <IconCreditCard
        className={`text-blue-600 ${size === 'small' ? 'w-6 h-6' : size === 'large' ? 'w-10 h-10' : 'w-8 h-8'}`}
        strokeWidth={1.5}
      />
      <div className={`font-semibold ${getSizeClasses()} text-gray-900`}>
        <span className="text-blue-600">CREDIT</span> CARD
        <div className={`${size === 'small' ? 'text-sm' : size === 'large' ? 'text-2xl' : 'text-xl'} text-gray-600`}>
          MANAGEMENT SYSTEM
        </div>
      </div>
    </div>
  );
} 