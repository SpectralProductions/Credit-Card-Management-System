import { Metadata } from "next";
import CardList from "./components/CardList";
import AddCardButton from "./components/AddCardButton";

export const metadata: Metadata = {
  title: "Credit Cards Management",
  description: "Manage your credit cards - view, add, edit, and delete cards",
};

export default async function CardsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Credit Cards</h1>
        <AddCardButton />
      </div>
      <CardList />
    </div>
  );
} 