import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET - Load user's conversations
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession()
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Niet geautoriseerd' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'Gebruiker niet gevonden' }, { status: 404 })
    }

    const conversations = await prisma.conversation.findMany({
      where: { userId: user.id },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' }
        }
      },
      orderBy: { updatedAt: 'desc' }
    })

    return NextResponse.json({ conversations })

  } catch (error) {
    console.error('Error loading conversations:', error)
    return NextResponse.json(
      { error: 'Fout bij het laden van conversaties' },
      { status: 500 }
    )
  }
}

// POST - Create new conversation or save message
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession()
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Niet geautoriseerd' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'Gebruiker niet gevonden' }, { status: 404 })
    }

    const { action, conversationId, message, role, title } = await req.json()

    if (action === 'create') {
      // Create new conversation
      const conversation = await prisma.conversation.create({
        data: {
          userId: user.id,
          title: title || 'Nieuwe conversatie'
        }
      })

      return NextResponse.json({ conversation })

    } else if (action === 'save_message') {
      // Save message to existing conversation
      if (!conversationId || !message || !role) {
        return NextResponse.json(
          { error: 'ConversationId, message en role zijn vereist' },
          { status: 400 }
        )
      }

      const savedMessage = await prisma.message.create({
        data: {
          conversationId,
          role,
          content: message
        }
      })

      // Update conversation timestamp
      await prisma.conversation.update({
        where: { id: conversationId },
        data: { updatedAt: new Date() }
      })

      return NextResponse.json({ message: savedMessage })
    }

    return NextResponse.json({ error: 'Ongeldige actie' }, { status: 400 })

  } catch (error) {
    console.error('Error saving conversation:', error)
    return NextResponse.json(
      { error: 'Fout bij het opslaan van conversatie' },
      { status: 500 }
    )
  }
} 