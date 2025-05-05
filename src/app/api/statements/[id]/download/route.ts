import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import PDFDocument from 'pdfkit';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Fetch statement with related data
    const statement = await prisma.statement.findFirst({
      where: {
        id: params.id,
        card: {
          userId: session.user.id,
        },
      },
      include: {
        card: {
          select: {
            cardNumber: true,
            creditLimit: true,
            currentBalance: true,
          },
        },
      },
    });

    if (!statement) {
      return NextResponse.json(
        { error: 'Statement not found' },
        { status: 404 }
      );
    }

    // Fetch transactions for the statement period
    const transactions = await prisma.transaction.findMany({
      where: {
        cardId: statement.cardId,
        timestamp: {
          gte: statement.billingDate,
          lte: statement.dueDate,
        },
      },
      orderBy: {
        timestamp: 'asc',
      },
    });

    // Create PDF
    const doc = new PDFDocument();
    const chunks: Buffer[] = [];

    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => {
      const result = Buffer.concat(chunks);
      // Return PDF buffer
      return new NextResponse(result, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="statement-${statement.id}.pdf"`,
        },
      });
    });

    // Add content to PDF
    doc
      .fontSize(20)
      .text('Credit Card Statement', { align: 'center' })
      .moveDown();

    doc
      .fontSize(12)
      .text(`Card Number: •••• ${statement.card.cardNumber.slice(-4)}`)
      .text(`Billing Date: ${statement.billingDate.toLocaleDateString()}`)
      .text(`Due Date: ${statement.dueDate.toLocaleDateString()}`)
      .text(`Credit Limit: $${statement.card.creditLimit.toFixed(2)}`)
      .text(`Current Balance: $${statement.card.currentBalance.toFixed(2)}`)
      .text(`Total Amount Due: $${statement.totalAmount.toFixed(2)}`)
      .text(`Minimum Payment Due: $${statement.minimumDue.toFixed(2)}`)
      .moveDown();

    // Add transactions table
    doc
      .fontSize(14)
      .text('Transactions', { underline: true })
      .moveDown();

    transactions.forEach((tx) => {
      doc
        .fontSize(10)
        .text(
          `${tx.timestamp.toLocaleDateString()} - ${tx.merchant} - $${tx.amount.toFixed(
            2
          )} - ${tx.status}`
        );
    });

    // Finalize PDF
    doc.end();

    return new NextResponse(null, { status: 200 });
  } catch (error) {
    console.error('Error generating PDF:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 