export { default } from 'next-auth/middleware'

export const config = {
  matcher: ['/app/:path*', '/api/user/:path*', '/api/payment/:path*'],
}
