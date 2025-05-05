'use client';

import Link from 'next/link';
import Logo from '@/components/shared/Logo';

export default function VerifyRequest() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        <div className="flex flex-col items-center">
          <Logo size="large" className="mb-8" />
          <h2 className="text-center text-3xl font-extrabold text-gray-900">
            Check your email
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            A sign in link has been sent to your email address.
          </p>
        </div>

        <div className="mt-4">
          <p className="text-sm text-gray-500">
            If you don't see it, check your spam folder. Still having problems?{' '}
            <Link href="/auth/signin" className="font-medium text-blue-600 hover:text-blue-500">
              Try another method
            </Link>
          </p>
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