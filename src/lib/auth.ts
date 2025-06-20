// Imports
import { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import EmailProvider from "next-auth/providers/email";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";

// ✅ Type Augmentation — better moved to `types/next-auth.d.ts`
declare module "next-auth" {
  interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    userRoles: { role: any }[]; // ✅ Type properly if you have a Role type
    roles?: any[];
    contact?: {
      id: string;
      email: string;
      phone?: string;
      address?: string;
      city?: string;
      state?: string;
      zip?: string;
      country?: string;
    };
  }

  interface Session {
    user: User & {
      name: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    firstName?: string;
    lastName?: string;
    name?: string;
    roles?: any[];
  }
}

// ✅ AUTH OPTIONS
export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    EmailProvider({
      server: {
        host: process.env.SMTP_HOST!,
        port: parseInt(process.env.SMTP_PORT!, 10), // ✅ Safer parse
        auth: {
          user: process.env.SMTP_USER!,
          pass: process.env.SMTP_PASSWORD!,
        },
      },
      from: process.env.SMTP_FROM!,
    }),

    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: {
            userRoles: { include: { role: true } },
          },
        });

        if (!user || !user.password) {
          throw new Error("Invalid credentials");
        }

        const isValid = await compare(credentials.password, user.password);
        if (!isValid) {
          throw new Error("Invalid credentials");
        }

        return {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          userRoles: user.userRoles,
          name: `${user.firstName} ${user.lastName}`,
        };
      },
    }),
  ],
  pages: {
    signIn: "/login",
    error: "/error",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const dbUser = await prisma.user.findUnique({
          where: { email: user.email ?? "" },
          include: {
            userRoles: { include: { role: true } },
          },
        });

        if (dbUser) {
          token.id = dbUser.id;
          token.firstName = dbUser.firstName;
          token.lastName = dbUser.lastName;
          token.name = `${dbUser.firstName} ${dbUser.lastName}`;
          token.roles = dbUser.userRoles.map((ur) => ur.role);
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.id!;
        session.user.firstName = token.firstName!;
        session.user.lastName = token.lastName!;
        session.user.name = token.name!;
        session.user.roles = token.roles!;
      }

      return session;
    },

    async signIn({ user, account }) {
      if (!user?.email) return false;

      const existingUser = await prisma.user.findUnique({
        where: { email: user.email },
      });

      if (!existingUser) return false;

      // Block sign-in if using email login and no password exists
      if (account?.provider === "email" && !existingUser.password) {
        return false;
      }

      return true;
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET!,
};