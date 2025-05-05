import 'next-auth';
import { User as PrismaUser } from '@prisma/client';

declare module 'next-auth' {
  interface User extends Omit<PrismaUser, 'emailVerified' | 'createdAt' | 'updatedAt'> {
    id: string;
    email: string | null;
    name: string | null;
  }

  interface Session {
    user: {
      id: string;
      email: string | null;
      name: string | null;
      image?: string | null;
    };
  }
} 