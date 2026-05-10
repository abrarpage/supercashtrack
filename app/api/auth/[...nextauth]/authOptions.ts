// JWT session + Credentials + Google, tanpa Prisma adapter (tanpa tabel account/session/verification_token).
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import type { NextAuthConfig } from "next-auth";
import { prisma } from "@/lib/prisma";
import { generatePublicId } from "@/lib/public-id";
import { ALL_DEFAULT_CATEGORIES } from "@/lib/constants";
import { verifyPassword } from "@/lib/password";
import { loginSchema } from "@/lib/validations/auth";
import { signJwtToken } from "@/services/server/auth";

async function provisionNewOAuthUser(userId: string) {
  for (let attempt = 0; attempt < 5; attempt++) {
    const publicId = generatePublicId();
    try {
      await prisma.user.update({
        where: { id: userId },
        data: { publicId },
      });
      break;
    } catch {
      // unique violation — coba lagi
    }
  }

  await prisma.category.createMany({
    data: ALL_DEFAULT_CATEGORIES.map((c) => ({
      userId,
      name: c.name,
      type: c.type,
      isDefault: true,
    })),
    skipDuplicates: true,
  });
}

export const authOptions = {
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Kata sandi", type: "password" },
      },
      async authorize(raw) {
        const parsed = loginSchema.safeParse(raw);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !user.password) return null;
        if (!verifyPassword(password, user.password)) return null;
        const access_token = signJwtToken(user, { expiresIn: "7d" });

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          access_token,
        };
      },
    }),
  ],
  secret: process.env.AUTH_SECRET,
  callbacks: {
    async jwt({ token, user, account, profile }) {
      if (account?.provider === "google" && profile?.email) {
        const email = profile.email;
        let dbUser = await prisma.user.findUnique({ where: { email } });
        if (!dbUser) {
          dbUser = await prisma.user.create({
            data: {
              email,
              name: profile.name ?? null,
              image: typeof profile.picture === "string" ? profile.picture : null,
            },
          });
          await provisionNewOAuthUser(dbUser.id);
        }
        token.id = dbUser.id;
        token.publicId = dbUser.publicId ?? null;
        token.access_token = signJwtToken(
          {
            id: dbUser.id,
            email: dbUser.email,
            name: dbUser.name,
            image: dbUser.image,
          },
          { expiresIn: "7d" },
        );
        return token;
      }

      if (user) {
        token.id = user.id;
        if ("access_token" in user && typeof user.access_token === "string") {
          token.access_token = user.access_token;
        } else if (user.email) {
          token.access_token = signJwtToken(
            {
              id: user.id,
              email: user.email,
              name: user.name,
              image: user.image,
            },
            { expiresIn: "7d" },
          );
        }
      }
      if (token.id && !token.publicId) {
        const row = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { publicId: true },
        });
        token.publicId = row?.publicId ?? null;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.publicId = (token.publicId as string | null) ?? null;
      }
      session.access_token =
        typeof token.access_token === "string" ? token.access_token : undefined;

      return session;
    },
  },
} satisfies NextAuthConfig;
