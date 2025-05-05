import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const statements = await prisma.statement.findMany({
      where: {
        card: {
          userId: session.user.id,
        },
      },
      include: {
        card: {
          select: {
            cardNumber: true,
          },
        },
      },
      orderBy: {
        billingDate: 'desc',
      },
    });

    return NextResponse.json({ statements });
  } catch (error) {
    console.error('Error fetching statements:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 