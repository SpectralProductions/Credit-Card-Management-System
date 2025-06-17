import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { PaymentMethod } from '@prisma/client';

// ✅ POST method to create a new payment
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions); // ✅ No `req` needed in App Router

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { cardId, amount, method } = body;

    if (!cardId || !amount || !method) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const card = await prisma.card.findFirst({
      where: {
        id: cardId,
        userId: session.user.id,
      },
    });

    if (!card) {
      return NextResponse.json({ error: 'Card not found or unauthorized' }, { status: 404 });
    }

    const payment = await prisma.$transaction(async (tx) => {
      const createdPayment = await tx.payment.create({
        data: {
          cardId,
          userId: session.user.id,
          amount,
          method: method as PaymentMethod,
        },
      });

      await tx.card.update({
        where: { id: cardId },
        data: {
          currentBalance: {
            decrement: amount,
          },
        },
      });

      return createdPayment;
    });

    return NextResponse.json(payment);
  } catch (error) {
    console.error('Error processing payment:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// ✅ GET method to fetch all payments for the logged-in user
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions); // ✅ No `req` needed in App Router

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payments = await prisma.payment.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        card: {
          select: {
            cardNumber: true,
          },
        },
      },
      orderBy: {
        paidAt: 'desc',
      },
    });

    return NextResponse.json({ payments });
  } catch (error) {
    console.error('Error fetching payments:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}