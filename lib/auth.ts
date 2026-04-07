import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

const ALLOWED_DOMAIN = "curadorbrands.com";
const ALLOWED_EMAILS = ["seanmatw@gmail.com"];

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ profile }) {
      if (!profile?.email) return false;

      const email = profile.email.toLowerCase();
      const domain = email.split("@")[1];

      if (domain !== ALLOWED_DOMAIN && !ALLOWED_EMAILS.includes(email)) {
        return false;
      }

      // Auto-create user on first login
      try {
        const existingUser = await db
          .select()
          .from(users)
          .where(eq(users.email, email))
          .limit(1);

        if (existingUser.length === 0) {
          await db.insert(users).values({
            name: (profile.name as string) ?? email.split("@")[0],
            email,
            googleSub: profile.sub as string,
            role: "member",
            active: true,
          });
        } else if (
          existingUser[0] &&
          (!existingUser[0].active || existingUser[0].deletedAt)
        ) {
          return false;
        } else if (existingUser[0] && !existingUser[0].googleSub) {
          await db
            .update(users)
            .set({ googleSub: profile.sub as string })
            .where(eq(users.email, email));
        }
      } catch (e) {
        console.error("[auth] signIn DB error:", e);
        return false;
      }

      return true;
    },

    async jwt({ token, profile }) {
      if (profile?.email) {
        token.email = profile.email.toLowerCase();
      }

      // Enrich token with DB user data on sign-in
      if (token.email && !token.dbId) {
        try {
          const dbUser = await db
            .select()
            .from(users)
            .where(eq(users.email, token.email as string))
            .limit(1);

          if (dbUser[0]) {
            token.dbId = dbUser[0].id;
            token.role = dbUser[0].role;
            token.marketingRole = dbUser[0].marketingRole;
          }
        } catch (e) {
          console.error("[auth] jwt DB error:", e);
        }
      }

      return token;
    },

    async session({ session, token }) {
      // Pull from JWT token — no DB call needed per request
      if (token.dbId) {
        session.user.id = token.dbId as string;
        session.user.role = (token.role as string) ?? "member";
        session.user.marketingRole = (token.marketingRole as string) ?? null;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
});
