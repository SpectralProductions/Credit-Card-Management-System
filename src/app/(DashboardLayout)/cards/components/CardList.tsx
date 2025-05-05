import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import CardItem from "./CardItem";
import { Card } from "@/types/card";

async function getCards() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return [];

  const cards = await prisma.card.findMany({
    where: {
      userId: session.user.id
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  return cards;
}

export default async function CardList() {
  const cards = await getCards();

  if (!cards.length) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No credit cards found. Add your first card to get started.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {cards.map((card: Card) => (
        <CardItem key={card.id} card={card} />
      ))}
    </div>
  );
} 