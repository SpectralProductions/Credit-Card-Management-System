import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { startOfMonth, endOfMonth, addMonths } from 'date-fns';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { cardId, month, year } = body;

    if (!cardId || month === undefined || year === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify card belongs to user
    const card = await prisma.card.findFirst({
      where: {
        id: cardId,
        userId: session.user.id,
      },
    });

    if (!card) {
      return NextResponse.json(
        { error: 'Card not found or unauthorized' },
        { status: 404 }
      );
    }

    // Calculate statement period
    const startDate = startOfMonth(new Date(year, month - 1));
    const endDate = endOfMonth(startDate);
    const dueDate = addMonths(endDate, 1);

    // Get all transactions for the period
    const transactions = await prisma.transaction.findMany({
      where: {
        cardId,
        timestamp: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    // Calculate totals
    const totalAmount = transactions.reduce(
      (sum, tx) => sum + tx.amount,
      0
    );
    const minimumDue = Math.max(totalAmount * 0.05, 25); // 5% or $25, whichever is higher

    // Create statement
    const statement = await prisma.statement.create({
      data: {
        cardId,
        billingDate: endDate,
        dueDate,
        totalAmount,
        minimumDue,
      },
    });

    // TODO: Send email notification
    // TODO: Generate PDF statement

    return NextResponse.json(statement);
  } catch (error) {
    console.error('Error generating statement:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 