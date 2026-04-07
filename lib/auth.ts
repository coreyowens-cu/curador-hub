import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { db } from "@/lib/db";
import { users, emailAllowlist } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

const ALLOWED_DOMAIN = "curadorbrands.com";

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

      // Check domain or allowlist table
      if (domain !== ALLOWED_DOMAIN) {
        try {
          const [allowed] = await db
            .select()
            .from(emailAllowlist)
            .where(eq(emailAllowlist.email, email))
            .limit(1);
          if (!allowed) return false;
        } catch (e) {
          console.error("[auth] allowlist check error:", e);
          return false;
        }
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
            token.isAdmin = dbUser[0].isAdmin;
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
        session.user.isAdmin = (token.isAdmin as boolean) ?? false;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
});
