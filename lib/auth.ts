import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import Google from 'next-auth/providers/google'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        })

        if (!user || !user.isActive || !user.password) return null

        const valid = await bcrypt.compare(credentials.password as string, user.password)
        if (!valid) return null

        return {
          id: String(user.id),
          email: user.email,
          name: `${user.firstName} ${user.lastName}`,
          image: user.image,
          role: user.role,
          firstName: user.firstName,
          lastName: user.lastName,
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'google') {
        const email = user.email!
        const googleId = account.providerAccountId
        const name = user.name ?? ''
        const image = user.image ?? null

        const [firstName, ...rest] = name.split(' ')
        const lastName = rest.join(' ') || ''

        const existing = await prisma.user.findUnique({ where: { email } })

        if (existing) {
          // Link Google to existing account if not already linked
          if (!existing.googleId) {
            await prisma.user.update({
              where: { email },
              data: { googleId, image },
            })
          }
          user.id = String(existing.id)
          ;(user as any).role = existing.role
          ;(user as any).firstName = existing.firstName
          ;(user as any).lastName = existing.lastName
        } else {
          // Create new account via Google
          const created = await prisma.user.create({
            data: {
              email,
              firstName,
              lastName,
              googleId,
              image,
              role: 'user',
              isActive: true,
            },
          })
          user.id = String(created.id)
          ;(user as any).role = created.role
          ;(user as any).firstName = created.firstName
          ;(user as any).lastName = created.lastName
        }
      }
      return true
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = (user as any).role
        token.firstName = (user as any).firstName
        token.lastName = (user as any).lastName
        token.image = user.image
      }
      return token
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        ;(session.user as any).role = token.role
        ;(session.user as any).firstName = token.firstName
        ;(session.user as any).lastName = token.lastName
        session.user.image = token.image as string
      }
      return session
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: { strategy: 'jwt' },
})
