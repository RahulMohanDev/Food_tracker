import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const consumables = await prisma.consumable.findMany({
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(consumables)
  } catch (error) {
    console.error('Error fetching consumables:', error)
    return NextResponse.json({ error: 'Failed to fetch consumables' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, calories, protein, carbs, fat, servingSize } = body

    const consumable = await prisma.consumable.create({
      data: {
        name,
        calories: parseFloat(calories),
        protein: parseFloat(protein),
        carbs: parseFloat(carbs),
        fat: parseFloat(fat),
        servingSize: parseFloat(servingSize),
      },
    })

    return NextResponse.json(consumable, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create consumable' }, { status: 500 })
  }
}
