export { default } from 'next-auth/middleware'

export const config = {
  matcher: [
    '/app/:path*',
    '/api/user/:path*',
    '/api/payment/initiate',
    '/api/payment/status',
    // webhook and verify are public (called by DusuPay / browser redirect)
  ],
}
