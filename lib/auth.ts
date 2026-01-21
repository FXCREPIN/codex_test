import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare, hash } from "bcryptjs";
import { prisma } from "./prisma";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt"
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: { teacherProfile: true }
        });

        if (!user) {
          const demoAccount = getDemoAccount(credentials.email);
          if (!demoAccount || demoAccount.password !== credentials.password) {
            return null;
          }

          const passwordHash = await hash(demoAccount.password, 10);
          const createdUser = await prisma.user.create({
            data: {
              email: demoAccount.email,
              passwordHash,
              role: demoAccount.role,
              teacherProfile: {
                create: {
                  name: demoAccount.name
                }
              }
            },
            include: { teacherProfile: true }
          });

          return {
            id: createdUser.id,
            name: createdUser.teacherProfile?.name ?? createdUser.email,
            email: createdUser.email,
            role: createdUser.role
          };
        }

        const passwordValid = await compare(credentials.password, user.passwordHash);
        if (!passwordValid) {
          return null;
        }

        return {
          id: user.id,
          name: user.teacherProfile?.name ?? user.email,
          email: user.email,
          role: user.role
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as { role: string }).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as string;
      }
      return session;
    }
  },
  pages: {
    signIn: "/login"
  }
};

export function requireRole(role: "ADMIN" | "PROF", sessionRole?: string | null) {
  if (!sessionRole || sessionRole !== role) {
    return false;
  }
  return true;
}

function getDemoAccount(email: string) {
  if (email === "direction@gmail.com") {
    return {
      email,
      password: "direction",
      role: "ADMIN" as const,
      name: "Direction"
    };
  }
  if (email === "professeur@gmail.com") {
    return {
      email,
      password: "professeur",
      role: "PROF" as const,
      name: "Professeur 1"
    };
  }
  return null;
}
