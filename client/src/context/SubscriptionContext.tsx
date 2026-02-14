import React, { createContext, useState, useEffect, type ReactNode } from 'react';
import api from '../services/api';
import type { Subscription } from '../types';
import { useAuth } from '../hooks/useAuth';

interface SubscriptionContextType {
  subscription: Subscription | null;
  loading: boolean;
  error: string | null;
  refreshSubscription: () => Promise<void>;
}

export const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export const SubscriptionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSubscription = async () => {
    if (!user) {
        setSubscription(null);
        return;
    }
    setLoading(true);
    setError(null);
    try {
      // Assuming we have an endpoint to get current user's subscription
      // We need to create this endpoint in backend later: GET /api/subscriptions/me
      const { data } = await api.get<Subscription>('/subscription/me'); 
      setSubscription(data);
    } catch (err: any) {
        // If 404, it just means no subscription, which is fine
        if (err.response && err.response.status === 404) {
            setSubscription(null);
        } else {
            setError('Failed to fetch subscription');
            console.error(err);
        }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscription();
  }, [user]);

  return (
    <SubscriptionContext.Provider value={{ subscription, loading, error, refreshSubscription: fetchSubscription }}>
      {children}
    </SubscriptionContext.Provider>
  );
};
