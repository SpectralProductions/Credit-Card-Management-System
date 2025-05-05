import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const cardNumber = searchParams.get('cardNumber');
    const expiryMonth = searchParams.get('expiryMonth');
    const expiryYear = searchParams.get('expiryYear');
    const cvv = searchParams.get('cvv');

    if (!cardNumber || !expiryMonth || !expiryYear || !cvv) {
      return NextResponse.json({ error: "All card details are required" }, { status: 400 });
    }

    // Find the card and validate all details
    const card = await prisma.card.findFirst({
      where: {
        userId: session.user.id,
        cardNumber: cardNumber,
        expiryMonth: parseInt(expiryMonth),
        expiryYear: parseInt(expiryYear),
        cvv: cvv,
      },
    });

    if (!card) {
      return NextResponse.json({ error: "Invalid card details" }, { status: 404 });
    }

    // Only return necessary card details
    return NextResponse.json({
      card: {
        id: card.id,
        cardNumber: card.cardNumber,
        cardholderName: card.cardholderName,
      },
    });
  } catch (error) {
    console.error("Error validating card:", error);
    return NextResponse.json(
      { error: "Failed to validate card" },
      { status: 500 }
    );
  }
} 