import { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "./prisma";
import EmailProvider from "next-auth/providers/email";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";

// Extend the built-in session types
declare module "next-auth" {
  interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    userRoles: any[];
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
      id: string;
      firstName: string;
      lastName: string;
      userRoles: any[];
      roles: any[];
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
    };
  }
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    EmailProvider({
      server: {
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT),
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD
        }
      },
      from: process.env.SMTP_FROM,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email,
          },
          include: {
            userRoles: {
              include: {
                role: true
              }
            }
          },
        });

        if (!user) {
          throw new Error("User not found");
        }

        if (!user.password) {
          throw new Error("Password not set. Please use social login or reset your password.");
        }

        const isPasswordValid = await compare(credentials.password, user.password);

        if (!isPasswordValid) {
          throw new Error("Invalid password");
        }

        return {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          userRoles: user.userRoles,
          name: `${user.firstName} ${user.lastName}`
        };
      },
    }),
  ],
  pages: {
    signIn: "/login",
    error: "/error",
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        // For both providers, fetch the complete user data
        const dbUser = await prisma.user.findUnique({
          where: { email: user.email },
          include: {
            userRoles: {
              include: {
                role: true
              }
            }
          },
        });

        if (dbUser) {
          token.id = dbUser.id;
          token.firstName = dbUser.firstName;
          token.lastName = dbUser.lastName;
          token.name = `${dbUser.firstName} ${dbUser.lastName}`;
          token.roles = dbUser.roles.map((ur: { role: any }) => ur.role);
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.firstName = token.firstName as string;
        session.user.lastName = token.lastName as string;
        session.user.name = token.name as string;
        session.user.roles = token.roles as any[];
      }
      return session;
    },
    async signIn({ user, account }) {
      if (!user?.email) return false;

      // Check if the user exists in the database
      const existingUser = await prisma.user.findUnique({
        where: { email: user.email },
      });

      if (!existingUser) {
        return false;
      }

      // For email provider, ensure the user has a password set
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
  // cookies: {
  //   sessionToken: {
  //     name: `__Secure-next-auth.session-token`,
  //     options: {
  //       httpOnly: true,
  //       sameSite: 'lax',
  //       path: '/',
  //       secure: true
  //     }
  //   },
  //   callbackUrl: {
  //     name: `__Secure-next-auth.callback-url`,
  //     options: {
  //       httpOnly: true,
  //       sameSite: 'lax',
  //       path: '/',
  //       secure: true
  //     }
  //   },
  //   csrfToken: {
  //     name: `__Host-next-auth.csrf-token`,
  //     options: {
  //       httpOnly: true,
  //       sameSite: 'lax',
  //       path: '/',
  //       secure: true
  //     }
  //   }
  // },
  secret: process.env.NEXTAUTH_SECRET,
}; 