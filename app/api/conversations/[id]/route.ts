import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// DELETE - Delete a conversation
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Check if conversation belongs to user
    const conversation = await prisma.conversation.findFirst({
      where: { 
        id: params.id,
        userId: user.id 
      }
    })

    if (!conversation) {
      return NextResponse.json({ error: 'Conversatie niet gevonden' }, { status: 404 })
    }

    // Delete conversation (messages will be deleted automatically due to cascade)
    await prisma.conversation.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Error deleting conversation:', error)
    return NextResponse.json(
      { error: 'Fout bij het verwijderen van conversatie' },
      { status: 500 }
    )
  }
} 