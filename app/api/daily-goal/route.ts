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

    const goal = await prisma.dailyGoal.findUnique({
      where: {
        userId_date: {
          userId,
          date: startDate,
        }
      },
    })

    return NextResponse.json(goal)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch daily goal' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }

    const body = await request.json()
    const { date, calories, protein, carbs, fat } = body

    const startDate = new Date(date)
    startDate.setHours(0, 0, 0, 0)

    const goal = await prisma.dailyGoal.upsert({
      where: {
        userId_date: {
          userId,
          date: startDate,
        }
      },
      update: {
        calories: parseFloat(calories),
        protein: parseFloat(protein),
        carbs: parseFloat(carbs),
        fat: parseFloat(fat),
      },
      create: {
        userId,
        date: startDate,
        calories: parseFloat(calories),
        protein: parseFloat(protein),
        carbs: parseFloat(carbs),
        fat: parseFloat(fat),
      },
    })

    return NextResponse.json(goal)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save daily goal' }, { status: 500 })
  }
}
