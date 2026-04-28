import { NextAuthOptions, User } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@auth/prisma-adapter'
import bcrypt from 'bcryptjs'
import { prisma } from './db'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name?: string | null
      image?: string | null
      plan: string
      songsPlayedMonth: number
      country?: string | null
    }
  }
  interface User {
    plan: string
    songsPlayedMonth: number
    country?: string | null
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    plan: string
    songsPlayedMonth: number
    country?: string | null
  }
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as NextAuthOptions['adapter'],
  session: { strategy: 'jwt' },
  secret: process.env.NEXTAUTH_SECRET,

  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password required')
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email.toLowerCase() },
        })

        if (!user || !user.password) {
          throw new Error('Invalid email or password')
        }

        const isValid = await bcrypt.compare(credentials.password, user.password)
        if (!isValid) {
          throw new Error('Invalid email or password')
        }

        // Reset monthly usage if needed
        const now = new Date()
        const resetDate = new Date(user.monthlyResetAt)
        const shouldReset =
          now.getFullYear() > resetDate.getFullYear() ||
          now.getMonth() > resetDate.getMonth()

        if (shouldReset) {
          await prisma.user.update({
            where: { id: user.id },
            data: { songsPlayedMonth: 0, monthlyResetAt: now },
          })
          user.songsPlayedMonth = 0
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.avatar,
          plan: user.plan,
          songsPlayedMonth: user.songsPlayedMonth,
          country: user.country,
        } as User
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id
        token.plan = user.plan
        token.songsPlayedMonth = user.songsPlayedMonth
        token.country = user.country ?? undefined
      }
      // Allow session update calls
      if (trigger === 'update' && session) {
        token.plan = session.plan ?? token.plan
        token.songsPlayedMonth = session.songsPlayedMonth ?? token.songsPlayedMonth
        token.name = session.name ?? token.name
        token.picture = session.image ?? token.picture
        token.country = session.country ?? token.country
      }
      return token
    },

    async session({ session, token }) {
      session.user.id = token.id
      session.user.plan = token.plan
      session.user.songsPlayedMonth = token.songsPlayedMonth
      session.user.country = token.country ?? null
      return session
    },
  },

  pages: {
    signIn: '/auth/login',
    error: '/auth/login',
  },
}
