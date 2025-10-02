import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }

    const searchParams = request.nextUrl.searchParams
    const date = searchParams.get('date')

    if (!date) {
      return NextResponse.json({ error: 'Date parameter required' }, { status: 400 })
    }

    const startDate = new Date(date)
    startDate.setHours(0, 0, 0, 0)
    const endDate = new Date(date)
    endDate.setHours(23, 59, 59, 999)

    const entries = await prisma.foodEntry.findMany({
      where: {
        userId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        consumable: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(entries)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch food entries' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }

    const body = await request.json()
    const { date, amount, consumableId, name, calories, protein, carbs, fat, description, imageUrl } = body

    const entry = await prisma.foodEntry.create({
      data: {
        userId,
        date: new Date(date),
        amount: parseFloat(amount),
        consumableId: consumableId || null,
        name,
        calories: parseFloat(calories),
        protein: parseFloat(protein),
        carbs: parseFloat(carbs),
        fat: parseFloat(fat),
        description,
        imageUrl,
      },
      include: {
        consumable: true,
      },
    })

    return NextResponse.json(entry, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create food entry' }, { status: 500 })
  }
}
