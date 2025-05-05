'use client';

import { useState } from 'react';
import { signOut } from 'next-auth/react';
import { useSession } from 'next-auth/react';
import Image from 'next/image';

export default function UserDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const { data: session } = useSession();

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/login' });
  };

  if (!session?.user) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-3 focus:outline-none"
      >
        <div className="flex items-center">
          {session.user.image ? (
            <Image
              src={session.user.image}
              alt="Profile"
              width={40}
              height={40}
              className="rounded-full"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
              {session.user.name?.[0] || session.user.email?.[0] || 'U'}
            </div>
          )}
        </div>
        <div className="hidden md:block text-left">
          <h3 className="text-sm font-medium text-gray-700">
            {session.user.name || 'User'}
          </h3>
          <p className="text-xs text-gray-500">{session.user.email}</p>
        </div>
        <svg
          className={`w-5 h-5 text-gray-400 transition-transform ${
            isOpen ? 'transform rotate-180' : ''
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 py-2 bg-white rounded-lg shadow-xl z-50">
          <div className="px-4 py-2 border-b">
            <p className="text-sm font-medium text-gray-700">
              {session.user.name || 'User'}
            </p>
            <p className="text-xs text-gray-500">{session.user.email}</p>
          </div>
          
          <a
            href="/profile"
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            Profile Settings
          </a>
          
          <button
            onClick={handleSignOut}
            className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
          >
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
} 