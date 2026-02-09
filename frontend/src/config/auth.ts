import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import prisma from '@/lib/prisma';

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        otp: { label: 'OTP', type: 'text' },
      },
      async authorize(credentials) {
        // TODO: Implement OTP verification logic
        // This is a skeleton - implement actual verification
        
        if (!credentials?.email || !credentials?.otp) {
          throw new Error('Missing credentials');
        }

        // Verify OTP against backend
        // const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/verify-otp`, {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify({
        //     email: credentials.email,
        //     otp: credentials.otp,
        //   }),
        // });

        // if (!response.ok) {
        //   throw new Error('Invalid OTP');
        // }

        // const user = await response.json();
        
        // Return user object
        // return {
        //   id: user.id,
        //   email: user.email,
        //   name: user.name,
        //   image: user.image,
        // };

        return null;
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },
  pages: {
    signIn: '/login',
    signOut: '/logout',
    error: '/login',
    verifyRequest: '/verify-otp',
  },
  callbacks: {
    async jwt({ token, user, account }) {
      // Initial sign in
      if (user) {
        token.id = user.id;
        token.email = user.email;
      }
      
      // TODO: Add custom claims to token
      
      return token;
    },
    async session({ session, token }) {
      // Add user id to session
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
      }
      
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Redirect to dashboard after sign in
      if (url.startsWith(baseUrl)) return url;
      if (url.startsWith('/')) return `${baseUrl}${url}`;
      return baseUrl + '/dashboard';
    },
  },
  events: {
    async signIn({ user, account, profile }) {
      // TODO: Log sign in event
      console.log('User signed in:', user.email);
    },
    async signOut({ token }) {
      // TODO: Log sign out event
      console.log('User signed out');
    },
  },
  debug: process.env.NODE_ENV === 'development',
  secret: process.env.NEXTAUTH_SECRET,
};