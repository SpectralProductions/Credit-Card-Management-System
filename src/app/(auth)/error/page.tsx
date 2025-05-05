'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Logo from '@/components/shared/Logo';

export default function AuthError() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  const getErrorMessage = (error: string | null) => {
    switch (error) {
      case 'Configuration':
        return 'There is a problem with the server configuration.';
      case 'AccessDenied':
        return 'You do not have permission to sign in.';
      case 'Verification':
        return 'The verification link may have expired or has already been used.';
      default:
        return 'An error occurred during authentication.';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        <div className="flex flex-col items-center">
          <Logo size="large" className="mb-8" />
          <h2 className="text-center text-3xl font-extrabold text-gray-900">
            Authentication Error
          </h2>
          <div className="mt-4 bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-sm text-red-700">
              {getErrorMessage(error)}
            </p>
          </div>
        </div>

        <div className="mt-8">
          <Link
            href="/auth/signin"
            className="text-sm font-medium text-blue-600 hover:text-blue-500"
          >
            ← Back to sign in
          </Link>
        </div>
      </div>
    </div>
  );
} 