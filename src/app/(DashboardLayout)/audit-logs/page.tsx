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

export default function AuditLogPage() {
  const { data: session } = useSession();
  const router = useRouter();

  const [formData, setFormData] = useState({
    action: '',
    details: '',
    ipAddress: '',
    userAgent: '',
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setFormData((prev) => ({
        ...prev,
        userAgent: navigator.userAgent || '',
        ipAddress: '', // You may fetch actual IP from a server or external service if needed
      }));
    }
  }, []);

  const handleTextFieldChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.action.trim()) {
      setError('Action field is required.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/audit-logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create audit log');
      }

      setSuccess('Audit log recorded successfully!');
      setFormData({
        action: '',
        details: '',
        ipAddress: '',
        userAgent: '',
      });
      router.refresh?.(); // Optional: reloads current page route
    } catch (err: any) {
      setError(err.message || 'An error occurred while logging the audit');
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
          Log an Admin Audit Entry
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          <TextField
            fullWidth
            label="Action"
            name="action"
            value={formData.action}
            onChange={handleTextFieldChange}
            required
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            label="Details"
            name="details"
            value={formData.details}
            onChange={handleTextFieldChange}
            multiline
            rows={3}
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            label="IP Address (optional)"
            name="ipAddress"
            value={formData.ipAddress}
            onChange={handleTextFieldChange}
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            label="User Agent"
            name="userAgent"
            value={formData.userAgent}
            onChange={handleTextFieldChange}
            sx={{ mb: 2 }}
          />

          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            disabled={loading}
          >
            {loading ? 'Logging...' : 'Log Audit Entry'}
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}
