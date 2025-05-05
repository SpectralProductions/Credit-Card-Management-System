import { Card, CardStatus } from "@/types/card";
import { formatCurrency } from "@/utils/format";
import EditCardButton from "./EditCardButton";
import DeleteCardButton from "./DeleteCardButton";

interface CardItemProps {
  card: Card;
}

function getStatusColor(status: CardStatus) {
  switch (status) {
    case "ACTIVE":
      return "bg-green-100 text-green-800";
    case "INACTIVE":
      return "bg-gray-100 text-gray-800";
    case "BLOCKED":
      return "bg-red-100 text-red-800";
    case "CLOSED":
      return "bg-yellow-100 text-yellow-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

export default function CardItem({ card }: CardItemProps) {
  const statusColor = getStatusColor(card.status);
  const maskedCardNumber = `•••• •••• •••• ${card.cardNumber.slice(-4)}`;
  const formattedExpiry = `${card.expiryMonth.toString().padStart(2, '0')}/${card.expiryYear.toString().slice(-2)}`;

  return (
    <div className="bg-white rounded-lg shadow-md p-6 relative">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-semibold text-gray-800">{maskedCardNumber}</h3>
          <p className="text-sm text-gray-500">
            {card.cardholderName}
          </p>
          <p className="text-sm text-gray-500">
            Expires: {formattedExpiry}
          </p>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor}`}>
          {card.status}
        </span>
      </div>
      
      <div className="space-y-2">
        <div>
          <p className="text-sm text-gray-500">Credit Limit</p>
          <p className="text-lg font-semibold">{formatCurrency(card.creditLimit)}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Current Balance</p>
          <p className="text-lg font-semibold">{formatCurrency(card.currentBalance)}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Available Credit</p>
          <p className="text-lg font-semibold">
            {formatCurrency(card.creditLimit - card.currentBalance)}
          </p>
        </div>
      </div>

      <div className="absolute top-2 right-2 flex space-x-2">
        <EditCardButton card={card} />
        <DeleteCardButton cardId={card.id} />
      </div>
    </div>
  );
} 