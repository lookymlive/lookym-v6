import type { NextAuthConfig } from "next-auth"
import Google from "next-auth/providers/google"

export const authConfig = {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const protectedPaths = ['/videos', '/upload', '/api/videos']
      const isProtectedRoute = protectedPaths.some(path => 
        nextUrl.pathname.startsWith(path)
      )
      
      if (isProtectedRoute) {
        if (isLoggedIn) return true
        return false // Redirect unauthenticated users to home page
      }
      return true
    },
  },
} satisfies NextAuthConfig