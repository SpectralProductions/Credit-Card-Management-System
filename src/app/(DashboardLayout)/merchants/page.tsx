'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
} from '@mui/material';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface CardValidation {
  cardNumber: boolean;
  expiryMonth: boolean;
  expiryYear: boolean;
  cvv: boolean;
}

export default function MerchantPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [formData, setFormData] = useState({
    cardNumber: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
    amount: '',
    merchant: '',
    description: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [validFields, setValidFields] = useState<CardValidation>({
    cardNumber: true,
    expiryMonth: true,
    expiryYear: true,
    cvv: true,
  });

  const validateCardNumber = (number: string) => {
    return /^\d{16}$/.test(number);
  };

  const validateExpiryMonth = (month: string) => {
    const monthNum = parseInt(month);
    return monthNum >= 1 && monthNum <= 12;
  };

  const validateExpiryYear = (year: string) => {
    const yearNum = parseInt(year);
    const currentYear = new Date().getFullYear();
    return yearNum >= currentYear && yearNum <= currentYear + 10;
  };

  const validateCVV = (cvv: string) => {
    return /^\d{3,4}$/.test(cvv);
  };

  const handleTextFieldChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Real-time validation
    if (name === 'cardNumber') {
      setValidFields(prev => ({
        ...prev,
        cardNumber: validateCardNumber(value),
      }));
    } else if (name === 'expiryMonth') {
      setValidFields(prev => ({
        ...prev,
        expiryMonth: validateExpiryMonth(value),
      }));
    } else if (name === 'expiryYear') {
      setValidFields(prev => ({
        ...prev,
        expiryYear: validateExpiryYear(value),
      }));
    } else if (name === 'cvv') {
      setValidFields(prev => ({
        ...prev,
        cvv: validateCVV(value),
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validate all card fields
    const isCardNumberValid = validateCardNumber(formData.cardNumber);
    const isExpiryMonthValid = validateExpiryMonth(formData.expiryMonth);
    const isExpiryYearValid = validateExpiryYear(formData.expiryYear);
    const isCVVValid = validateCVV(formData.cvv);

    setValidFields({
      cardNumber: isCardNumberValid,
      expiryMonth: isExpiryMonthValid,
      expiryYear: isExpiryYearValid,
      cvv: isCVVValid,
    });

    if (!isCardNumberValid || !isExpiryMonthValid || !isExpiryYearValid || !isCVVValid) {
      setError('Please correct the invalid fields');
      return;
    }

    // Validate amount
    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    setLoading(true);

    try {
      // First, validate the card with all details
      const cardResponse = await fetch(
        `/api/cards/validate?cardNumber=${formData.cardNumber}&expiryMonth=${formData.expiryMonth}&expiryYear=${formData.expiryYear}&cvv=${formData.cvv}`
      );
      const cardData = await cardResponse.json();

      if (!cardResponse.ok || !cardData.card) {
        throw new Error(cardData.error || 'Invalid card details');
      }

      // Create the transaction using the card ID
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cardId: cardData.card.id,
          amount: amount,
          merchant: formData.merchant,
          description: formData.description,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create transaction');
      }

      setSuccess('Transaction created successfully!');
      setFormData({
        cardNumber: '',
        expiryMonth: '',
        expiryYear: '',
        cvv: '',
        amount: '',
        merchant: '',
        description: '',
      });
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'An error occurred while creating the transaction');
    } finally {
      setLoading(false);
    }
  };

  if (!session) {
    return (
      <Card>
        <CardContent>
          <Typography>Please sign in to access this page.</Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Typography variant="h4" gutterBottom>
          Add New Transaction
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          <TextField
            fullWidth
            label="Card Number"
            name="cardNumber"
            value={formData.cardNumber}
            onChange={handleTextFieldChange}
            required
            error={!validFields.cardNumber}
            helperText={!validFields.cardNumber ? 'Please enter a valid 16-digit card number' : ''}
            placeholder="Enter your 16-digit card number"
            sx={{ mb: 2 }}
          />

          <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
            <Box sx={{ flex: '1 1 calc(33.33% - 16px)', minWidth: '200px' }}>
              <TextField
                fullWidth
                label="Expiry Month"
                name="expiryMonth"
                type="number"
                value={formData.expiryMonth}
                onChange={handleTextFieldChange}
                required
                error={!validFields.expiryMonth}
                helperText={!validFields.expiryMonth ? 'Enter month (1-12)' : ''}
                inputProps={{ min: "1", max: "12" }}
              />
            </Box>
            <Box sx={{ flex: '1 1 calc(33.33% - 16px)', minWidth: '200px' }}>
              <TextField
                fullWidth
                label="Expiry Year"
                name="expiryYear"
                type="number"
                value={formData.expiryYear}
                onChange={handleTextFieldChange}
                required
                error={!validFields.expiryYear}
                helperText={!validFields.expiryYear ? 'Enter valid year' : ''}
                inputProps={{ min: new Date().getFullYear(), max: new Date().getFullYear() + 10 }}
              />
            </Box>
            <Box sx={{ flex: '1 1 calc(33.33% - 16px)', minWidth: '200px' }}>
              <TextField
                fullWidth
                label="CVV"
                name="cvv"
                type="password"
                value={formData.cvv}
                onChange={handleTextFieldChange}
                required
                error={!validFields.cvv}
                helperText={!validFields.cvv ? 'Enter 3-4 digit CVV' : ''}
                inputProps={{ maxLength: 4 }}
              />
            </Box>
          </Box>

          <TextField
            fullWidth
            label="Amount"
            name="amount"
            type="number"
            value={formData.amount}
            onChange={handleTextFieldChange}
            required
            inputProps={{ 
              min: "0.01",
              step: "0.01"
            }}
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            label="Merchant Name"
            name="merchant"
            value={formData.merchant}
            onChange={handleTextFieldChange}
            required
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleTextFieldChange}
            multiline
            rows={4}
            sx={{ mb: 2 }}
          />

          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            disabled={loading || !validFields.cardNumber || !validFields.expiryMonth || !validFields.expiryYear || !validFields.cvv}
          >
            {loading ? 'Creating Transaction...' : 'Create Transaction'}
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
} 