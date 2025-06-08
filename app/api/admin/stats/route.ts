import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Simple admin check - you can change these emails to your admin emails
const ADMIN_EMAILS = [
  'admin@example.com',
  'your-email@domain.com',
  'sanderhelmink@gmail.com',
  // Add your admin email here
]

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession()
    
    // Check if user is logged in
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Niet geautoriseerd' }, { status: 401 })
    }

    // Check if user is admin
    if (!ADMIN_EMAILS.includes(session.user.email)) {
      return NextResponse.json({ error: 'Geen admin rechten' }, { status: 403 })
    }

    // Get current date for today/week calculations
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)

    // Fetch all statistics in parallel
    const [
      totalUsers,
      totalConversations,
      totalMessages,
      usersByProfession,
      recentUsers,
      conversationsToday,
      messagesThisWeek
    ] = await Promise.all([
      // Total users count
      prisma.user.count(),
      
      // Total conversations count
      prisma.conversation.count(),
      
      // Total messages count
      prisma.message.count(),
      
      // Users grouped by profession
      prisma.user.groupBy({
        by: ['profession'],
        _count: {
          profession: true
        }
      }),
      
      // Recent users (last 10)
      prisma.user.findMany({
        select: {
          name: true,
          email: true,
          profession: true,
          createdAt: true
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: 10
      }),
      
      // Conversations created today
      prisma.conversation.count({
        where: {
          createdAt: {
            gte: today
          }
        }
      }),
      
      // Messages from this week
      prisma.message.count({
        where: {
          createdAt: {
            gte: weekAgo
          }
        }
      })
    ])

    // Calculate average messages per conversation
    const averageMessagesPerConversation = totalConversations > 0 
      ? Math.round(totalMessages / totalConversations) 
      : 0

    // Transform profession data
    const PROFESSION_NAMES = {
      general: 'Algemeen publiek',
      lawyer: 'Advocaat',
      police: 'Politieagent',
      judge: 'Rechter/Jurist',
      civil_servant: 'Ambtenaar'
    }

    const formattedUsersByProfession = usersByProfession.map((item: any) => ({
      profession: item.profession,
      count: item._count.profession,
      name: PROFESSION_NAMES[item.profession as keyof typeof PROFESSION_NAMES] || item.profession
    }))

    // Response data
    const stats = {
      totalUsers,
      totalConversations,
      totalMessages,
      usersByProfession: formattedUsersByProfession,
      recentUsers,
      conversationsToday,
      messagesThisWeek,
      averageMessagesPerConversation
    }

    return NextResponse.json(stats)

  } catch (error) {
    console.error('Error fetching admin stats:', error)
    return NextResponse.json(
      { error: 'Fout bij het ophalen van statistieken' },
      { status: 500 }
    )
  }
} 