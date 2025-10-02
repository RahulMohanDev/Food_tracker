import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = request.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }

    const { id } = await params
    await prisma.foodEntry.delete({
      where: { id, userId },
    })
    return NextResponse.json({ message: 'Food entry deleted' })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete food entry' }, { status: 500 })
  }
}
