import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const dateStr = searchParams.get('date')

    if (!dateStr) {
      return NextResponse.json({ error: 'Date required' }, { status: 400 })
    }

    const date = new Date(dateStr)
    const startDate = new Date(date.setHours(0, 0, 0, 0))
    const endDate = new Date(date.setHours(23, 59, 59, 999))

    // Get all users
    const users = await prisma.user.findMany({
      orderBy: { name: 'asc' },
    })

    // Get stats for each user
    const leaderboard = await Promise.all(
      users.map(async (user) => {
        // Get user's goal for the date
        const goal = await prisma.dailyGoal.findUnique({
          where: {
            userId_date: {
              userId: user.id,
              date: startDate,
            },
          },
        })

        // Get user's food entries for the date
        const entries = await prisma.foodEntry.findMany({
          where: {
            userId: user.id,
            date: {
              gte: startDate,
              lte: endDate,
            },
          },
        })

        // Calculate totals
        const totals = entries.reduce(
          (acc, entry) => ({
            calories: acc.calories + entry.calories,
            protein: acc.protein + entry.protein,
            carbs: acc.carbs + entry.carbs,
            fat: acc.fat + entry.fat,
          }),
          { calories: 0, protein: 0, carbs: 0, fat: 0 }
        )

        // Calculate goal completion percentage
        const goalPercentage = goal
          ? {
              calories: goal.calories > 0 ? (totals.calories / goal.calories) * 100 : 0,
              protein: goal.protein > 0 ? (totals.protein / goal.protein) * 100 : 0,
              carbs: goal.carbs > 0 ? (totals.carbs / goal.carbs) * 100 : 0,
              fat: goal.fat > 0 ? (totals.fat / goal.fat) * 100 : 0,
            }
          : null

        const averageGoalPercentage = goalPercentage
          ? (goalPercentage.calories + goalPercentage.protein + goalPercentage.carbs + goalPercentage.fat) / 4
          : 0

        return {
          userId: user.id,
          userName: user.name,
          totals,
          goal: goal || null,
          goalPercentage,
          averageGoalPercentage,
          entriesCount: entries.length,
        }
      })
    )

    // Sort by average goal percentage (highest first)
    leaderboard.sort((a, b) => b.averageGoalPercentage - a.averageGoalPercentage)

    return NextResponse.json(leaderboard)
  } catch (error) {
    console.error('Error fetching leaderboard:', error)
    return NextResponse.json({ error: 'Failed to fetch leaderboard' }, { status: 500 })
  }
}
