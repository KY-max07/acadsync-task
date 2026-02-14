import React, { createContext, useState, useEffect, type ReactNode } from 'react';
import api from '../services/api';
import type { PricingResponse } from '../types';

interface PricingConfig {
    plans: {
        individual: { monthly: number; yearly: number };
        organization: { monthly: number; yearly: number };
        custom: { monthly: number; yearly: number };
    };
    rolePrice: number;
}

interface PricingState {
  subscriptionType: 'individual' | 'organization' | 'custom';
  selectedPortals: string[];
  selectedFeatures: string[];
  pricing: PricingResponse | null;
  loading: boolean;
  error: string | null;
  pricingConfig: PricingConfig | null;
}

interface PricingContextType extends PricingState {
  setSubscriptionType: (type: 'individual' | 'organization' | 'custom') => void;
  togglePortal: (portalName: string) => void;
  toggleFeature: (featureName: string) => void;
  calculatePrice: () => Promise<void>;
  resetSelection: () => void;
}

export const PricingContext = createContext<PricingContextType | undefined>(undefined);

export const PricingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [subscriptionType, setSubscriptionType] = useState<'individual' | 'organization' | 'custom'>('individual');
  const [selectedPortals, setSelectedPortals] = useState<string[]>([]);
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [pricing, setPricing] = useState<PricingResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pricingConfig, setPricingConfig] = useState<PricingConfig | null>(null);

  // Fetch initial config
  useEffect(() => {
      const fetchConfig = async () => {
          try {
              const { data } = await api.get('/admin/pricing');
              setPricingConfig(data);
          } catch (e) {
              console.error("Failed to fetch pricing config", e);
          }
      };
      fetchConfig();
  }, []);

  // Auto-calculate on changes
  useEffect(() => {
    // Debounce or just call if valid selection
    if (subscriptionType === 'individual' && selectedPortals.length === 1) {
      calculatePrice();
    } else if (subscriptionType === 'organization') {
      calculatePrice();
    } else if (subscriptionType === 'custom' && selectedPortals.length > 0) {
      calculatePrice();
    } else {
        // Reset pricing if invalid state (e.g. no portal selected for individual)
        setPricing(null);
    }
  }, [subscriptionType, selectedPortals, selectedFeatures]);

  const calculatePrice = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.post<PricingResponse>('/pricing/calculate', {
        subscriptionType,
        selectedPortals,
        selectedFeatures
      });
      setPricing(data);
    } catch (err) {
      setError('Failed to calculate pricing');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const togglePortal = (portalName: string) => {
    if (subscriptionType === 'individual') {
      // Only one allowed
      setSelectedPortals([portalName]);
    } else if (subscriptionType === 'organization') {
      // Locked, verify if we even allow toggling (usually NO)
      // Ideally UI should prevent calling this, but we can enforce:
      // do nothing
    } else {
      // Custom: toggle
      if (selectedPortals.includes(portalName)) {
        setSelectedPortals(prev => prev.filter(p => p !== portalName));
      } else {
        setSelectedPortals(prev => [...prev, portalName]);
      }
    }
  };

  const toggleFeature = (featureName: string) => {
    if (selectedFeatures.includes(featureName)) {
      setSelectedFeatures(prev => prev.filter(f => f !== featureName));
    } else {
      setSelectedFeatures(prev => [...prev, featureName]);
    }
  };
  
  const resetSelection = () => {
      setSelectedPortals([]);
      setSelectedFeatures([]);
      setPricing(null);
  };

  // Special handling when switching types
  const handleSetSubscriptionType = (type: 'individual' | 'organization' | 'custom') => {
      setSubscriptionType(type);
      if (type === 'organization') {
          // Organization implies ALL three
          setSelectedPortals(['school', 'teacher', 'student']);
          setSelectedFeatures([]); // Reset features or select defaults if any
      } else if (type === 'individual') {
          // Reset to none or keep first if valid? standard is reset to force user to pick one
          setSelectedPortals([]); 
          setSelectedFeatures([]);
      } else {
          // Custom - keep what we have or reset? 
          // Keeping selection is friendlier if moving from individual -> custom
          if (selectedPortals.length === 0) setSelectedPortals([]);
      }
  };

  return (
    <PricingContext.Provider value={{
      subscriptionType,
      selectedPortals,
      selectedFeatures,
      pricing,
      loading,
      error,
      pricingConfig,
      setSubscriptionType: handleSetSubscriptionType,
      togglePortal,
      toggleFeature,
      calculatePrice,
      resetSelection
    }}>
      {children}
    </PricingContext.Provider>
  );
};
