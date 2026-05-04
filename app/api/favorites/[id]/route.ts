import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const propertyId = parseInt(id)
  const userId = parseInt(session.user.id)

  const existing = await prisma.user.findFirst({
    where: {
      id: userId,
      favoriteProperties: { some: { id: propertyId } },
    },
  })

  if (existing) {
    await prisma.user.update({
      where: { id: userId },
      data: { favoriteProperties: { disconnect: { id: propertyId } } },
    })
    return NextResponse.json({ favorited: false })
  } else {
    await prisma.user.update({
      where: { id: userId },
      data: { favoriteProperties: { connect: { id: propertyId } } },
    })
    return NextResponse.json({ favorited: true })
  }
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ favorited: false })
  }

  const { id } = await params
  const propertyId = parseInt(id)
  const userId = parseInt(session.user.id)

  const existing = await prisma.user.findFirst({
    where: {
      id: userId,
      favoriteProperties: { some: { id: propertyId } },
    },
  })

  return NextResponse.json({ favorited: !!existing })
}
