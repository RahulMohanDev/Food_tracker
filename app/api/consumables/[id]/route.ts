import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { name, calories, protein, carbs, fat, servingSize } = body

    const consumable = await prisma.consumable.update({
      where: { id },
      data: {
        name,
        calories: parseFloat(calories),
        protein: parseFloat(protein),
        carbs: parseFloat(carbs),
        fat: parseFloat(fat),
        servingSize: parseFloat(servingSize),
      },
    })

    return NextResponse.json(consumable)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update consumable' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await prisma.consumable.delete({
      where: { id },
    })
    return NextResponse.json({ message: 'Consumable deleted' })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete consumable' }, { status: 500 })
  }
}
