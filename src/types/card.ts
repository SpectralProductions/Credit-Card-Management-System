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
} 