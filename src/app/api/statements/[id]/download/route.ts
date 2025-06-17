import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import PDFDocument from 'pdfkit';
import { Readable } from 'stream';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
)
{
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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
      return NextResponse.json({ error: 'Statement not found' }, { status: 404 });
    }

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

    // Create PDF and await its buffer
    const pdfBuffer: Buffer = await new Promise((resolve, reject) => {
      const doc = new PDFDocument();
      const chunks: Buffer[] = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', (err) => reject(err));

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

      doc.fontSize(14).text('Transactions', { underline: true }).moveDown();

      transactions.forEach((tx) => {
        doc
          .fontSize(10)
          .text(
            `${tx.timestamp.toLocaleDateString()} - ${tx.merchant} - $${tx.amount.toFixed(
              2
            )} - ${tx.status}`
          );
      });

      doc.end();
    });

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="statement-${params.id}.pdf"`,
      },
    });
  } catch (error) {
    console.error('Error generating PDF:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}