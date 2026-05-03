/* eslint-disable @typescript-eslint/no-var-requires */
/**
 * Seed an admin / test account.
 *
 * Usage on Render Shell (or locally):
 *   node scripts/seed-admin.js
 *
 * Override defaults with env vars if you want:
 *   ADMIN_EMAIL=you@example.com ADMIN_PASSWORD='S3cret!' ADMIN_NAME='Owner' node scripts/seed-admin.js
 */
const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || 'admin@alyrics.app').toLowerCase()
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'AdminPass123!'
const ADMIN_NAME = process.env.ADMIN_NAME || 'Admin'

async function main() {
  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10)

  const user = await prisma.user.upsert({
    where: { email: ADMIN_EMAIL },
    update: {
      password: passwordHash,
      plan: 'VIP',
      planExpiresAt: new Date(Date.now() + 100 * 365 * 24 * 60 * 60 * 1000), // ~100 years
      songsPlayedMonth: 0,
      monthlyResetAt: new Date(),
    },
    create: {
      email: ADMIN_EMAIL,
      name: ADMIN_NAME,
      password: passwordHash,
      plan: 'VIP',
      planExpiresAt: new Date(Date.now() + 100 * 365 * 24 * 60 * 60 * 1000),
    },
  })

  console.log('\n=== Admin / test account ready ===')
  console.log('Email:    ', user.email)
  console.log('Password: ', ADMIN_PASSWORD)
  console.log('Plan:     ', user.plan)
  console.log('==================================\n')
  console.log('Login at: /auth/login')
}

main()
  .catch((err) => {
    console.error('Failed to seed admin:', err)
    process.exitCode = 1
  })
  .finally(() => prisma.$disconnect())
