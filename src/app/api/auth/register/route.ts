import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/db'

const schema = z.object({
  name: z.string().min(2).max(60),
  email: z.string().email(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  country: z.string().optional(),
})

export async function POST(request: NextRequest) {
  const body: unknown = await request.json()
  const parsed = schema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 })
  }

  const { name, email, password, country } = parsed.data
  const lowerEmail = email.toLowerCase()

  const existing = await prisma.user.findUnique({ where: { email: lowerEmail } })
  if (existing) {
    return NextResponse.json({ error: { email: ['Email already in use'] } }, { status: 409 })
  }

  const hashed = await bcrypt.hash(password, 12)

  const user = await prisma.user.create({
    data: {
      name,
      email: lowerEmail,
      password: hashed,
      country,
      plan: 'FREE',
    },
    select: { id: true, email: true, name: true, plan: true },
  })

  return NextResponse.json({ user }, { status: 201 })
}
