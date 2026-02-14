import Pricing, { IPricing } from '../models/Pricing';
// We might still keep Portal for features if needed, but let's stick to Pricing model for main plans as user requested.

interface PricingRequest {
  subscriptionType: 'individual' | 'organization' | 'custom';
  selectedPortals: string[]; 
  selectedFeatures: string[];
  billingCycle?: 'monthly' | 'yearly'; // Added to support cycle
}

interface PricingResponse {
  basePrice: number;
  discount: number;
  finalPrice: number;
  breakdown: {
    portals: { name: string; price: number }[];
    features: { name: string; price: number }[];
    bundleDiscount?: string;
  };
}

export const calculatePricing = async (data: PricingRequest): Promise<PricingResponse> => {
  const { subscriptionType, selectedPortals, selectedFeatures, billingCycle = 'monthly' } = data;

  // Fetch Pricing Config
  let pricingConfig = await Pricing.findOne();
  if (!pricingConfig) {
      // Fallback default
      pricingConfig = await Pricing.create({});
  }

  const cycleKey = billingCycle === 'yearly' ? 'yearly' : 'monthly';
  let basePrice = 0;
  let discount = 0;
  const breakdown: PricingResponse['breakdown'] = { portals: [], features: [] };

  if (subscriptionType === 'individual') {
      basePrice = pricingConfig.plans.individual[cycleKey];
      breakdown.portals.push({ name: 'Individual Plan', price: basePrice });
      
  } else if (subscriptionType === 'organization') {
      basePrice = pricingConfig.plans.organization[cycleKey];
      breakdown.portals.push({ name: 'Organization Plan', price: basePrice });
      
  } else if (subscriptionType === 'custom') {
      // Custom Base + Roles
      const customBase = pricingConfig.plans.custom[cycleKey]; // Usually 0 or base fee
      basePrice += customBase;
      if (customBase > 0) breakdown.portals.push({ name: 'Custom Base', price: customBase });

      // Calculate Roles
      const roleCost = pricingConfig.rolePrice; 
      // Adjust role price for yearly? usually yes.
      const adjustedRolePrice = billingCycle === 'yearly' ? roleCost * 10 : roleCost; 

      const rolesTotal = selectedPortals.length * adjustedRolePrice;
      basePrice += rolesTotal;
      
      selectedPortals.forEach(p => {
          breakdown.portals.push({ name: `Role: ${p}`, price: adjustedRolePrice });
      });
  }

  // Features (Placeholder - logic to add feature prices if we had them in Pricing model)
  // For now, assuming Features are included or 0.

  return {
    basePrice,
    discount,
    finalPrice: basePrice - discount,
    breakdown
  };
};
