// types/next-auth.d.ts
import { DefaultSession } from 'next-auth';
import { User as PrismaUser } from '@prisma/client';

declare module 'next-auth' {
  interface User extends Omit<PrismaUser, 'emailVerified' | 'createdAt' | 'updatedAt'> {}

  interface Session {
    user: {
      id: string;
      email: string | null;
      name: string | null;
      image?: string | null;
    } & DefaultSession['user'];
  }
}
