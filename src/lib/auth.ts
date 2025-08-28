import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

export const { handlers, auth } = NextAuth({
  providers: [
    Credentials({
      name: "Credentials",
      credentials: { email: {}, password: {} },
      async authorize(creds) {
        // TODO: replace with real lookup. For now, mock one user.
        if (creds?.email && creds.password === "demo") {
          return {
            id: "demo-user-id-123",
            email: creds.email,
            name: "Demo User",
            role: "driver",
          };
        }
        return null;
      },
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
        (token as any).role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      session.user = {
        ...session.user,
        id: token.sub!,
        role: (token as any).role,
      };
      return session;
    },
  },
});
