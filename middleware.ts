import NextAuth from "next-auth"
import { authConfig } from "./auth.config"

export default NextAuth(authConfig).auth

// Protect specific routes
export const config = {
  matcher: [
    '/videos/:path*',
    '/upload/:path*',
    '/api/videos/:path*',
  ]
}