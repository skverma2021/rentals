import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import { prisma } from "@/lib/prisma";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (!user.email || !account) {
        return false;
      }

      // Check if user is pre-authorized in our database
      const authUser = await prisma.authUsers.findFirst({
        where: {
          email: user.email,
          isActive: true,
        },
        include: {
          agency: true,
        },
      });

      if (!authUser) {
        // User not pre-authorized by any agency
        console.log(`Unauthorized login attempt: ${user.email}`);
        return false;
      }

      // Update OAuth provider info and last login
      await prisma.authUsers.update({
        where: { id: authUser.id },
        data: {
          provider: account.provider,
          providerId: account.providerAccountId,
          avatarUrl: user.image || null,
          lastLoginAt: new Date(),
        },
      });

      return true;
    },

    async jwt({ token, user, account }) {
      if (user?.email) {
        // Fetch user details from our database
        const authUser = await prisma.authUsers.findFirst({
          where: {
            email: user.email,
            isActive: true,
          },
          include: {
            agency: true,
          },
        });

        if (authUser) {
          token.userId = authUser.id;
          token.agencyId = authUser.agencyId;
          token.agencyName = authUser.agency.name;
          token.role = authUser.role;
          token.firstName = authUser.firstName;
          token.lastName = authUser.lastName;
        }
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        (session.user as { id: number }).id = token.userId as number;
        (session.user as { agencyId: number }).agencyId = token.agencyId as number;
        (session.user as { agencyName: string }).agencyName = token.agencyName as string;
        (session.user as { role: string }).role = token.role as string;
        (session.user as { firstName: string }).firstName = token.firstName as string;
        (session.user as { lastName: string }).lastName = token.lastName as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  session: {
    strategy: "jwt",
  },
});
