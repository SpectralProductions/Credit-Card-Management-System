import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth/authOptions';

// Export handlers for App Router
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };