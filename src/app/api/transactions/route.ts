import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

const ITEMS_PER_PAGE = 10;

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const status = searchParams.get('status') as 'PENDING' | 'SUCCESS' | 'FAILED' | null;
    const minAmount = searchParams.get('minAmount');
    const maxAmount = searchParams.get('maxAmount');
    const merchant = searchParams.get('merchant');

    // Build where clause based on filters
    const where = {
      card: {
        userId: session.user.id,
      },
      ...(startDate && {
        timestamp: {
          gte: new Date(startDate),
        },
      }),
      ...(endDate && {
        timestamp: {
          ...(startDate && { gte: new Date(startDate) }),
          lte: new Date(endDate),
        },
      }),
      ...(status && { status }),
      ...(minAmount && { amount: { gte: parseFloat(minAmount) } }),
      ...(maxAmount && {
        amount: {
          ...(minAmount && { gte: parseFloat(minAmount) }),
          lte: parseFloat(maxAmount),
        },
      }),
      ...(merchant && {
        merchant: {
          contains: merchant,
          mode: 'insensitive',
        },
      }),
    };

    // Get total count for pagination
    const totalCount = await prisma.transaction.count({ where });
    const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

    // Get transactions with pagination
    const transactions = await prisma.transaction.findMany({
      where,
      orderBy: {
        timestamp: 'desc',
      },
      skip: (page - 1) * ITEMS_PER_PAGE,
      take: ITEMS_PER_PAGE,
      include: {
        card: {
          select: {
            cardNumber: true,
          },
        },
      },
    });

    return NextResponse.json({
      transactions,
      totalPages,
      currentPage: page,
      totalCount,
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

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
    const { cardId, amount, merchant, description } = body;

    // Validate required fields
    if (!cardId || !amount || !merchant) {
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

    // Create transaction
    const transaction = await prisma.transaction.create({
      data: {
        cardId,
        amount,
        merchant,
        description,
        status: 'SUCCESS',
      },
    });

    return NextResponse.json(transaction);
  } catch (error) {
    console.error('Error creating transaction:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 