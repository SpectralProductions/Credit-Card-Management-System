import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await req.json();
    const { cardNumber, cardholderName, creditLimit, expiryMonth, expiryYear, cvv, isActive } = data;

    // Validate required fields
    if (!cardNumber || !cardholderName || !creditLimit || !expiryMonth || !expiryYear || !cvv) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Create new card
    const card = await prisma.card.create({
      data: {
        cardNumber,
        cardholderName,
        creditLimit,
        expiryMonth,
        expiryYear,
        cvv,
        isActive: isActive ?? true,
        userId: session.user.id
      }
    });

    return NextResponse.json(card);
  } catch (error) {
    console.error("Error creating card:", error);
    return NextResponse.json(
      { error: "Failed to create card" },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const cardNumber = searchParams.get('cardNumber');

    // If cardNumber is provided, validate it
    if (cardNumber) {
      const card = await prisma.card.findFirst({
        where: {
          userId: session.user.id,
          cardNumber: cardNumber,
        },
      });

      if (!card) {
        return NextResponse.json({ error: "Card not found" }, { status: 404 });
      }

      return NextResponse.json({ card });
    }

    // If no cardNumber provided, return all cards
    const cards = await prisma.card.findMany({
      where: {
        userId: session.user.id
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({ cards });
  } catch (error) {
    console.error("Error fetching cards:", error);
    return NextResponse.json(
      { error: "Failed to fetch cards" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const cardId = searchParams.get('id');

    if (!cardId) {
      return NextResponse.json({ error: "Card ID is required" }, { status: 400 });
    }

    // Verify card belongs to user
    const card = await prisma.card.findFirst({
      where: {
        id: cardId,
        userId: session.user.id
      }
    });

    if (!card) {
      return NextResponse.json({ error: "Card not found" }, { status: 404 });
    }

    // Delete card
    await prisma.card.delete({
      where: {
        id: cardId
      }
    });

    return NextResponse.json({ message: "Card deleted successfully" });
  } catch (error) {
    console.error("Error deleting card:", error);
    return NextResponse.json(
      { error: "Failed to delete card" },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const cardId = searchParams.get('id');
    const data = await req.json();

    if (!cardId) {
      return NextResponse.json({ error: "Card ID is required" }, { status: 400 });
    }

    // Verify card belongs to user
    const card = await prisma.card.findFirst({
      where: {
        id: cardId,
        userId: session.user.id
      }
    });

    if (!card) {
      return NextResponse.json({ error: "Card not found" }, { status: 404 });
    }

    // Update card
    const updatedCard = await prisma.card.update({
      where: {
        id: cardId
      },
      data: {
        cardNumber: data.cardNumber,
        cardholderName: data.cardholderName,
        creditLimit: data.creditLimit,
        expiryMonth: data.expiryMonth,
        expiryYear: data.expiryYear,
        cvv: data.cvv,
        isActive: data.isActive
      }
    });

    return NextResponse.json(updatedCard);
  } catch (error) {
    console.error("Error updating card:", error);
    return NextResponse.json(
      { error: "Failed to update card" },
      { status: 500 }
    );
  }
} 