import NextAuth from "next-auth";
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // 1. Ensure DB Connection
        await connectDB();

        // 2. Normalize email to lowercase (Matches registration logic)
        const email = credentials?.email?.toLowerCase();

        // 3. Find User
        const user = await User.findOne({ email });
        if (!user) throw new Error("No user found with this email identity");

        // 4. Verify Password
        const isValid = await bcrypt.compare(credentials!.password, user.password);
        if (!isValid) throw new Error("Security check failed: Incorrect password");

        // 5. Return object (Keep it lean to avoid 431 Header errors)
        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          shopName: user.shopName,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.shopName = (user as any).shopName;
      }
      // Captures updates from the Settings page
      if (trigger === "update" && session) {
        token.name = session.user.name;
        token.shopName = session.user.shopName;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).shopName = token.shopName;
      }
      return session;
    },
  },
  pages: { 
    signIn: "/login",
    error: "/login", // Redirects back to login on failure instead of hanging
  },
  session: { 
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };