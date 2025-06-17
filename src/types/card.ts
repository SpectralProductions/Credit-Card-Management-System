export type CardStatus = 'ACTIVE' | 'INACTIVE' | 'BLOCKED' | 'CLOSED';

export interface Card {
  id: string;
  userId: string;
  cardNumber: string;
  cardholderName: string;
  expiryMonth: number;
  expiryYear: number;
  cvv: string;
  creditLimit: number;
  currentBalance: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  status: CardStatus;
  activationDate: Date;
  currency?: string;         // e.g., 'INR', 'USD' (for international support)
  country?: string;          // Country of issuance
  isVirtual?: boolean;       // To support virtual cards
  lockedReason?: string;
} 