import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { z } from "zod";
import { db } from "@/lib/db";

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt", maxAge: 60 * 60 * 12 },
  pages: { signIn: "/login" },
  providers: [
    Credentials({
      credentials: { email: {}, password: {} },
      async authorize(credentials) {
        const parsed = z
          .object({ email: z.email(), password: z.string().min(1) })
          .safeParse(credentials);
        if (!parsed.success) return null;
        const user = await db.user.findUnique({
          where: { email: parsed.data.email.toLowerCase() },
        });
        if (
          !user?.active ||
          !(await compare(parsed.data.password, user.passwordHash))
        )
          return null;
        return { id: user.id, name: user.name, email: user.email };
      },
    }),
  ],
});
