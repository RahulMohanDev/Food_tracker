import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { logError } from '@/lib/logger'

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }

    // Get user's house
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { houseId: true },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get consumables for user's house
    const consumables = await prisma.consumable.findMany({
      where: { houseId: user.houseId },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(consumables)
  } catch (error) {
    logError('GET /api/consumables', error)
    return NextResponse.json({ error: 'Failed to fetch consumables' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  let body: any = {}
  try {
    body = await request.json()
    const { name, calories, protein, carbs, fat, servingSize } = body
    const userId = request.headers.get('x-user-id')

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }

    // Get user's house
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { houseId: true },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Validate required fields - check for empty strings and missing values
    if (!name || !name.trim()) {
      logError('POST /api/consumables', new Error('Missing name'), { body })
      return NextResponse.json({
        error: 'Name is required'
      }, { status: 400 })
    }

    // Convert to numbers and validate
    const numCalories = parseFloat(calories)
    const numProtein = parseFloat(protein)
    const numCarbs = parseFloat(carbs)
    const numFat = parseFloat(fat)
    const numServingSize = parseFloat(servingSize)

    if (isNaN(numCalories) || isNaN(numProtein) || isNaN(numCarbs) ||
        isNaN(numFat) || isNaN(numServingSize)) {
      logError('POST /api/consumables', new Error('Invalid numeric values'), { body })
      return NextResponse.json({
        error: 'All nutritional values must be valid numbers'
      }, { status: 400 })
    }

    // Create consumable for user's house
    const consumable = await prisma.consumable.create({
      data: {
        name: name.trim(),
        calories: numCalories,
        protein: numProtein,
        carbs: numCarbs,
        fat: numFat,
        servingSize: numServingSize,
        houseId: user.houseId,
      },
    })

    return NextResponse.json(consumable, { status: 201 })
  } catch (error) {
    logError('POST /api/consumables', error, { body })
    return NextResponse.json({ error: 'Failed to create consumable' }, { status: 500 })
  }
}
