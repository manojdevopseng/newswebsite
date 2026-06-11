import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'

export const { handlers, signIn, signOut, auth } = NextAuth({
  secret: process.env.AUTH_SECRET,
  session: { strategy: 'jwt', maxAge: 7 * 24 * 60 * 60 }, // 7 days
  pages: {
    signIn: '/admin/login',
    error: '/admin/login',
  },
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email:    { label: 'Email',    type: 'email'    },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const email    = credentials?.email    as string
        const password = credentials?.password as string

        if (!email || !password) return null
        if (email !== process.env.ADMIN_EMAIL) return null

        // Use bcrypt hash if available, fallback to plaintext for migration
        const hash = process.env.ADMIN_PASSWORD_HASH
        const valid = hash
          ? await bcrypt.compare(password, hash)
          : password === process.env.ADMIN_PASSWORD

        if (!valid) return null

        return {
          id:    '1',
          email: process.env.ADMIN_EMAIL,
          name:  'Admin',
          role:  'admin',
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.role = (user as any).role
      return token
    },
    async session({ session, token }) {
      if (session.user) (session.user as any).role = token.role
      return session
    },
  },
})
