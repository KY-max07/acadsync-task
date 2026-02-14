import { useState } from 'react';
import { useSubscription } from '../hooks/useSubscription';
import { usePricing } from '../hooks/usePricing';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Loader2 } from 'lucide-react';


const MyPurchases = () => {
    const { subscription, loading } = useSubscription();
    const { pricingConfig } = usePricing();
    const navigate = useNavigate();
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
    
    // Fallback if config not loaded yet, or handle loading state
    const getPrice = (type: 'individual' | 'organization' | 'custom', cycle: 'monthly' | 'yearly') => {
        if (!pricingConfig) return 0;
        return pricingConfig.plans[type][cycle];
    };
    
    const rolePrice = pricingConfig?.rolePrice || 5000;

    const plans = [
      {
        id: 'individual',
        name: 'Individual',
        role: 'For Tutors',
        price: { monthly: getPrice('individual', 'monthly'), yearly: getPrice('individual', 'yearly') },
        features: ['1 Portal Limit', 'Basic Analytics'],
      },
      {
        id: 'organization',
        name: 'Organization',
        role: 'For Schools',
        price: { monthly: getPrice('organization', 'monthly'), yearly: getPrice('organization', 'yearly') },
        features: ['Unlimited Portals', 'Advanced Reports'],
      },
      {
        id: 'custom',
        name: 'Custom',
        role: 'For Universities',
        // Show rolePrice as starting price (e.g. 5000) instead of huge custom base
        price: { 
            monthly: rolePrice, 
            yearly: rolePrice * 10 
        },
        features: ['Custom Integrations', 'Dedicated Manager'],
      }
    ];
  
    const [configuringPlan, setConfiguringPlan] = useState<typeof plans[0] | null>(null);
    const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  
    // Prices for roles
    const ROLE_PRICES: Record<string, number> = {
        student: rolePrice,
        teacher: rolePrice,
        school: rolePrice,
    };

    if (loading || !pricingConfig) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin" /></div>;

    const isUpgradeAllowed = (targetPlanId: string, targetCycle: 'monthly' | 'yearly') => {
        const currentPlan = subscription?.subscriptionType;
        const currentCycle = subscription?.billingCycle;

        // 1. Current Plan is always "allowed" in UI to show "Current", but logic handled in render
        if (targetPlanId === currentPlan && targetCycle === currentCycle) return true;

        // 2. Yearly users cannot switch back to Monthly
        if (currentCycle === 'yearly' && targetCycle === 'monthly') return false;

        // 3. Organization Yearly cannot upgrade/switch to anything
        if (currentPlan === 'organization' && currentCycle === 'yearly') return false;

         // 4. Organization Monthly
        if (currentPlan === 'organization' && currentCycle === 'monthly') {
             // Block all monthly, allow all yearly
             return targetCycle === 'yearly';
        }

        // 5. Individual/Custom Monthly
        if (currentCycle === 'monthly') {
             if (targetCycle === 'yearly') return true; // Show yearly all

             // Monthly targets:
             if (targetPlanId === 'organization') return false; // Block Organization
             
             // Swap logic
             if (currentPlan === 'custom' && targetPlanId === 'individual') return true;
             if (currentPlan === 'individual' && targetPlanId === 'custom') return true;
             
             return false;
        }

        // 6. Individual/Custom Yearly
        if (currentCycle === 'yearly') {
             // Target is Yearly (Monthly blocked by #2)
             if (targetPlanId === 'organization') return false; // Block Organization

             // Swap logic
             if (currentPlan === 'custom' && targetPlanId === 'individual') return true;
             if (currentPlan === 'individual' && targetPlanId === 'custom') return true;

             return false;
        }

        return false;
    };

    const handlePurchaseClick = (plan: typeof plans[0], cycle: 'monthly' | 'yearly') => {
        // For Organization, no role selection needed (all included)
        if (plan.id === 'organization') {
             navigate('/upgrade', { 
                state: { 
                    plan, 
                    billingCycle: cycle, 
                    amount: cycle === 'monthly' ? plan.price.monthly : plan.price.yearly,
                    roles: ['student', 'teacher', 'school'] 
                } 
            });
            return;
        }

        // For Individual/Custom, open configuration modal
        setConfiguringPlan(plan);
        
        // Pre-select current roles if they exist
        const currentRoles = subscription?.portalsIncluded || [];
        
        if (plan.id === 'individual') {
             // If moving to individual, we can only have one.
             // If currently have multiple, maybe default to first? Or empty to force choice?
             // Let's default to the first one they have, if any.
             if (currentRoles.length > 0) {
                 setSelectedRoles([currentRoles[0]]);
             } else {
                 setSelectedRoles([]);
             }
        } else {
            // For Custom/Others, pre-select all they have
            // If they have none, default to 'teacher' so the price matches the card display (5000)
            if (currentRoles.length > 0) {
                setSelectedRoles(currentRoles);
            } else {
                setSelectedRoles(['teacher']);
            }
        }
    };

    const handleConfirmConfiguration = () => {
        if (!configuringPlan) return;

        let basePrice = 0;
        if (configuringPlan.id === 'individual') basePrice = configuringPlan.price[billingCycle];
        if (configuringPlan.id === 'custom') {
            // Base for custom is 0, add role prices
             selectedRoles.forEach(role => {
                const rolePrice = ROLE_PRICES[role] || 0;
                basePrice += (billingCycle === 'yearly' ? rolePrice * 10 : rolePrice);
            });
             // Add base custom price? Register.tsx said CUSTOM_BASE_PRICE = 0 plus roles.
             // But plans array here says Custom has price: { monthly: 25000... }
             // Let's stick to Register.tsx logic: Custom = Sum of Roles. 
             // BUT, the plans array in this file defines a price. 
             // Let's reconcile:
             // If plan.id === 'custom', we ignore plan.price and calculate based on roles?
             // Or maybe plan.price is a "minimum" or "base fee"?
             // Register.tsx: "base = CUSTOM_BASE_PRICE (0) + roles".
             // MyPurchases.tsx here has: price: { monthly: 25000, ... }
             // If I follow register logic, I should calculate from 0. 
             // If I follow the display price here (25000), it contradicts "Configure".
             // I will assume for Upgrade, we follow the "Register" logic for Custom (pay per role).
             // However, `individual` has a fixed price too.
        }

        // Re-calculate strictly:
        let finalAmount = 0;
        if (configuringPlan.id === 'individual') {
             finalAmount = billingCycle === 'monthly' ? configuringPlan.price.monthly : configuringPlan.price.yearly;
        } else if (configuringPlan.id === 'custom') {
             selectedRoles.forEach(role => {
                const rolePrice = ROLE_PRICES[role] || 0;
                finalAmount += (billingCycle === 'yearly' ? rolePrice * 10 : rolePrice);
            });
        }

        navigate('/upgrade', { 
            state: { 
                plan: configuringPlan, 
                billingCycle, 
                amount: finalAmount,
                roles: selectedRoles
            } 
        });
    };

    const toggleRole = (role: string) => {
        if (configuringPlan?.id === 'individual') {
            // Single select for individual
            setSelectedRoles([role]);
        } else {
            // Multi select for custom
            if (selectedRoles.includes(role)) {
                setSelectedRoles(selectedRoles.filter(r => r !== role));
            } else {
                setSelectedRoles([...selectedRoles, role]);
            }
        }
    };
  
    return (
      <div className="max-w-7xl mx-auto p-8 relative">
        <h1 className="text-4xl font-display mb-8">My Purchases</h1>

        {/* Current Subscription Section ... */}
        {subscription ? (
             <div className="bg-black text-white p-8 mb-16 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.2)]">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                    <div>
                        <h2 className="text-2xl font-bold mb-1">Current Subscription</h2>
                        <span className="bg-white text-black text-xs font-bold px-2 py-1 uppercase rounded-sm">
                            {subscription.status}
                        </span>
                    </div>
                     <div className="text-right mt-4 md:mt-0">
                         <div className="text-3xl font-display capitalize">{subscription.subscriptionType} Plan</div>
                         <div className="text-gray-400 capitalize">{subscription.billingCycle} Billing</div>
                     </div>
                </div>

                <div className="border-t border-gray-800 pt-6 flex flex-col md:flex-row gap-8">
                    <div className="flex-1">
                        <p className="text-gray-400 text-sm mb-1 uppercase tracking-wider">Price</p>
                        <p className="text-xl font-bold">₹{subscription.finalPrice?.toLocaleString()}<span className="text-sm font-normal text-gray-500">/{subscription.billingCycle === 'monthly' ? 'mo' : 'yr'}</span></p>
                    </div>
                    <div className="flex-1">
                        <p className="text-gray-400 text-sm mb-1 uppercase tracking-wider">Renewal Date</p>
                        <p className="text-xl font-bold">{new Date(subscription.endDate).toLocaleDateString()}</p>
                    </div>
                    <div className="flex-1">
                         <p className="text-gray-400 text-sm mb-1 uppercase tracking-wider">Next Billing Amount</p>
                         <p className="text-xl font-bold">₹{subscription.finalPrice?.toLocaleString()}</p>
                    </div>
                </div>

                {/* Active Portals */}
                <div className="border-t border-gray-800 pt-6 mt-6">
                    <p className="text-gray-400 text-sm mb-3 uppercase tracking-wider">Active Portals</p>
                    <div className="flex flex-wrap gap-3">
                        {subscription.portalsIncluded.map(portal => (
                            <span key={portal} className="bg-neutral-800 border border-neutral-700 text-white text-sm font-bold px-4 py-2 rounded-full capitalize flex items-center gap-2">
                                <CheckCircle size={14} className="text-green-500" />
                                {portal} Portal
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        ) : (
            <div className="bg-gray-100 p-8 mb-16 text-center rounded-lg">
                <h2 className="text-xl font-bold text-gray-700">No Active Subscription</h2>
                <p className="text-gray-500">Select a plan below to get started.</p>
            </div>
        )}

        <div className="mb-12">
            <h2 className="text-3xl font-display mb-6">Available Plans & Upgrades</h2>
             {/* Toggle */}
            <div className="flex justify-center mb-8">
                <div className="inline-flex items-center p-1 bg-white border border-black rounded-full">
                    <button 
                    onClick={() => setBillingCycle('monthly')}
                    className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${billingCycle === 'monthly' ? 'bg-black text-white' : 'text-gray-500 hover:text-black'}`}
                    >
                        Monthly
                    </button>
                    <button 
                    onClick={() => setBillingCycle('yearly')}
                    className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${billingCycle === 'yearly' ? 'bg-black text-white' : 'text-gray-500 hover:text-black'}`}
                    >
                        Yearly <span className="ml-1 text-[10px] text-green-600">(Save 20%)</span>
                    </button>
                </div>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
                {plans.map((plan) => {
                    const isCurrent = plan.id === subscription?.subscriptionType;
                    const isSameCycle = billingCycle === subscription?.billingCycle;
                    const allowed = isUpgradeAllowed(plan.id, billingCycle);
                    // Keep price display dynamic based on toggle
                    const displayPrice = billingCycle === 'monthly' ? plan.price.monthly : plan.price.yearly;

                    // Determine Button Text & State
                    let buttonText = `Buy ${plan.name}`;
                    let isDisabled = !allowed;
                    
                    if (isCurrent && isSameCycle) {
                        if (plan.id === 'custom') {
                            // Allow modifying custom plan (add/remove portals)
                            buttonText = "Modify Portals";
                            isDisabled = false;
                        } else if (plan.id === 'individual') {
                             // Allow switching role within individual
                            buttonText = "Switch Role";
                            isDisabled = false;
                        } else {
                            buttonText = "Current Plan";
                            isDisabled = true;
                        }
                    } else if (!allowed) {
                        buttonText = "Unavailable";
                    } else if (isCurrent && !isSameCycle) {
                        buttonText = billingCycle === 'yearly' ? 'Upgrade to Yearly' : 'Switch to Monthly';
                        // Allow modifying logic during upgrade too
                        isDisabled = false; 
                    }

                    
                    return (
                        <div key={plan.id} className={`bg-white border-2 p-8 flex flex-col transition-all relative ${isCurrent ? 'border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]' : 'border-gray-200 hover:border-black hover:shadow-lg'} ${!allowed && !isCurrent ? 'opacity-50 grayscale' : ''}`}>
                             {isCurrent && (
                                <div className="absolute top-0 right-0 bg-black text-white text-xs font-bold px-3 py-1 uppercase">
                                    Current
                                </div>
                            )}

                             <div className="mb-4">
                                <span className="text-xs font-bold uppercase tracking-wider bg-gray-100 px-2 py-1 rounded">{plan.role}</span>
                                <h3 className="text-2xl font-bold mt-2">{plan.name}</h3>
                            </div>
                            <div className="mb-6">
                                <span className="text-3xl font-display">₹{displayPrice.toLocaleString()}</span>
                                <span className="text-gray-500">/{billingCycle === 'monthly' ? 'mo' : 'yr'}</span>
                            </div>

                             <ul className="mb-8 space-y-3 flex-1">
                                {plan.features.map((feature) => (
                                    <li key={feature} className="flex items-start">
                                        <CheckCircle size={18} className="mr-2 shrink-0 text-black" />
                                        <span className="text-sm font-medium">{feature}</span>
                                    </li>
                                ))}
                            </ul>

                             <button 
                                onClick={() => handlePurchaseClick(plan, billingCycle)}
                                disabled={isDisabled}
                                className={`w-full py-3 font-bold uppercase transition-colors flex justify-center items-center gap-2
                                    ${isDisabled
                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200' 
                                        : 'bg-black text-white hover:bg-neutral-800'
                                    }`}
                            >
                                {buttonText}
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>

        {/* Configuration Modal */}
        {configuringPlan && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-white max-w-lg w-full p-8 shadow-2xl border-2 border-black animate-in fade-in zoom-in-95 duration-200">
                    <h2 className="text-3xl font-display mb-2">Configure {configuringPlan.name} Plan</h2>
                    <p className="text-gray-500 mb-6">Select the roles you need access for.</p>

                    <div className="space-y-3 mb-8">
                        {['student', 'teacher', 'school'].map(role => (
                            <label key={role} className={`flex items-center justify-between p-4 border cursor-pointer transition-all ${selectedRoles.includes(role) ? 'border-black bg-gray-50' : 'border-gray-200 hover:border-gray-400'}`}>
                                <div className="flex items-center gap-3">
                                    <input 
                                        type={configuringPlan.id === 'individual' ? 'radio' : 'checkbox'}
                                        name="role-select"
                                        checked={selectedRoles.includes(role)}
                                        onChange={() => toggleRole(role)}
                                        className="w-4 h-4 accent-black"
                                    />
                                    <span className="font-bold uppercase text-sm">{role}</span>
                                </div>
                                {configuringPlan.id === 'custom' && (
                                     <span className="text-sm text-gray-500">+₹{(ROLE_PRICES[role] * (billingCycle === 'yearly' ? 10 : 1)).toLocaleString()}</span>
                                )}
                            </label>
                        ))}
                    </div>

                    <div className="flex gap-4">
                        <button 
                            onClick={() => setConfiguringPlan(null)}
                            className="flex-1 py-3 font-bold uppercase border border-black hover:bg-gray-100"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={handleConfirmConfiguration}
                            disabled={selectedRoles.length === 0}
                            className="flex-1 py-3 font-bold uppercase bg-black text-white hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Proceed
                        </button>
                    </div>
                </div>
            </div>
        )}
      </div>
    );
  };
  
  export default MyPurchases;
