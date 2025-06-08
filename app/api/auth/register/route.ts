import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

export async function POST(req: NextRequest) {
  try {
    const { email, password, name, profession = 'general' } = await req.json()

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Email, wachtwoord en naam zijn vereist' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Een gebruiker met dit e-mailadres bestaat al' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        profession,
      }
    })

    return NextResponse.json({
      message: 'Gebruiker succesvol aangemaakt',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        profession: user.profession,
      }
    })

  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Er is een fout opgetreden bij het aanmaken van het account' },
      { status: 500 }
    )
  }
} 