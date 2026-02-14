import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

import { useNavigate, Link } from 'react-router-dom';
import Input from '../components/Input';
import Button from '../components/Button';
import { ChevronRight, CreditCard, ShieldCheck } from 'lucide-react';
import api from '../services/api';

// --- Zod Schemas ---
const step1Schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  phoneNumber: z.string().min(10, 'Invalid phone number'),
  organizationType: z.enum(['School', 'College', 'University', 'Other'] as const, {
    message: 'Please select an organization type',
  }),
});

type Step1Data = z.infer<typeof step1Schema>;

const paymentMethods = [
  { id: 'card', name: 'Credit/Debit Card', icon: CreditCard },
  { id: 'upi', name: 'UPI', icon: ShieldCheck }, // Using ShieldCheck as placeholder for UPI icon
  { id: 'netbanking', name: 'Net Banking', icon: ChevronRight }, // Placeholder
];

interface Plan {
    id: string;
    name: string;
    price: number;
    yearlyPrice: number;
    label: string;
    features: string[];
}

const Register = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<Partial<Step1Data>>({});
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'upi' | 'netbanking' | null>(null);
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);

  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  
  // Dynamic Pricing State
  const [plans, setPlans] = useState<Plan[]>([
      { id: 'individual', name: 'Individual', price: 5000, yearlyPrice: 50000, label: 'For Tutors', features: ['1 Portal Limit', 'Basic Analytics'] },
      { id: 'organization', name: 'Organization', price: 15000, yearlyPrice: 150000, label: 'For Schools', features: ['Unlimited Portals', 'Advanced Reports'] },
      // Custom price starts at 1 role price (e.g. 5000)
      { id: 'custom', name: 'Custom', price: 5000, yearlyPrice: 50000, label: 'For Universities', features: ['Custom Integrations', 'Dedicated Manager'] },
  ]);
  const [rolePrice, setRolePrice] = useState(5000);

  useEffect(() => {
    const fetchPricing = async () => {
        try {
            const { data } = await api.get('/admin/pricing');
            // Update plans with fetched pricing
            setPlans(prev => prev.map(p => {
                if (p.id === 'individual') {
                    return { ...p, price: data.plans.individual.monthly, yearlyPrice: data.plans.individual.yearly };
                } else if (p.id === 'organization') {
                    return { ...p, price: data.plans.organization.monthly, yearlyPrice: data.plans.organization.yearly };
                } else if (p.id === 'custom') {
                    // Start custom at 1 role price
                    return { 
                        ...p, 
                        price: data.rolePrice, 
                        yearlyPrice: data.rolePrice * 10 
                    };
                }
                return p;
            }));
            setRolePrice(data.rolePrice);
        } catch (error) {
            console.error('Failed to fetch pricing', error);
        }
    };
    fetchPricing();
  }, []);
  
  // Payment State
  const [cardDetails, setCardDetails] = useState({ number: '', expiry: '', cvc: '' });
  const [upiId, setUpiId] = useState('');
  const [paymentError, setPaymentError] = useState('');

  const validatePayment = () => {
    setPaymentError('');
    if (!paymentMethod) {
        setPaymentError('Please select a payment method');
        return false;
    }

    if (paymentMethod === 'card') {
        // Basic Validation
        if (!cardDetails.number || cardDetails.number.length < 16) {
            setPaymentError('Invalid Card Number');
            return false;
        }
        if (!cardDetails.expiry || !cardDetails.expiry.includes('/')) {
             setPaymentError('Invalid Expiry Date (MM/YY)');
             return false;
        }
        if (!cardDetails.cvc || cardDetails.cvc.length < 3) {
             setPaymentError('Invalid CVC');
             return false;
        }
    }

    if (paymentMethod === 'upi') {
        if (!upiId || !upiId.includes('@')) {
            setPaymentError('Invalid UPI ID');
            return false;
        }
    }

    return true;
  };

  const handleStep3Submit = () => {
      if(validatePayment()) {
          setStep(4);
      }
  };

  // --- Step 1 Form ---
  const { register, handleSubmit, formState: { errors } } = useForm<Step1Data>({
    resolver: zodResolver(step1Schema),
    defaultValues: formData as Step1Data
  });

  const onStep1Submit = async (data: Step1Data) => {
    setFormData(data);
    setStep(2);
  };

  const calculatePrice = (planId: string | null, cycle: 'monthly' | 'yearly', roles: string[]) => {
    if (!planId) return 0;
    
    let base = 0;
    const plan = plans.find(p => p.id === planId);
    
    if (plan && planId !== 'custom') {
        base = cycle === 'yearly' ? plan.yearlyPrice : plan.price;
    } else if (planId === 'custom' && plan) {
        // Custom Base is 0, purely role based
        const roleCost = cycle === 'yearly' ? rolePrice * 10 : rolePrice;
        base = roles.length * roleCost;
    }

    return base;
  };

  const handlePlanSelect = (planId: string, roles: string[] = []) => {
    setSelectedPlan(planId);
    // If roles provided, set them. If Organization, default to all.
    if (planId === 'organization') {
        setSelectedRoles(['student', 'teacher', 'school']);
    } else if (planId === 'custom') {
        // Default to teacher if no specific roles passed (which is usual case from card click)
        if (roles.length > 0) {
             setSelectedRoles(roles);
        } else {
             setSelectedRoles(['teacher']);
        }
    } else {
        setSelectedRoles(roles);
    }
    
    if (planId !== 'custom') {
        setStep(3);
    }
  };

  const handleFinalPayment = async () => {
    if (!selectedPlan || !paymentMethod) return;

    setIsProcessing(true);

    try {
      // Simulate 5 second processing delay
      await new Promise(resolve => setTimeout(resolve, 5000));

      // 1. Prepare Data
      const amount = calculatePrice(selectedPlan, billingCycle, selectedRoles);
      
      const payload = {
        ...formData,
        subscriptionPlan: selectedPlan,
        paymentMethod: paymentMethod,
        amount: amount,
        billingCycle: billingCycle,
        portalsIncluded: selectedRoles.length > 0 ? selectedRoles : undefined
      };

      // 2. Call Register with Subscription Endpoint
      await api.post('/auth/register-with-subscription', payload);

      // 3. User created successfully. Redirect to login.
      toast.success('Registration successful! Please login.');
      navigate('/login');

    } catch (error: any) {
      console.error("Registration failed", error);
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setIsProcessing(false);
    }
  };


  return (
    <div className="min-h-screen bg-white text-black font-body flex flex-col">
      {/* Header */}
      <header className="p-6 border-b border-black flex justify-between items-center">
        <Link to="/" className="text-3xl font-display italic flex gap-4">
              <svg width="30" height="30" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 28.4356C16.5306 28.4357 13.3035 30.2166 11.4521 33.1512L9.1543 36.7934L10.0371 37.3511C10.3132 37.5101 10.5937 37.6622 10.8779 37.8082L13.1436 34.2188C14.6285 31.8648 17.2171 30.437 20 30.4369C22.783 30.4369 25.3714 31.8647 26.8564 34.2188L29.1211 37.8082C29.4053 37.6623 29.6858 37.5101 29.9619 37.3511L30.8457 36.7934L28.5479 33.1512C26.6964 30.2165 23.4695 28.4356 20 28.4356ZM20.123 36.4428L20 36.4379C19.3855 36.4381 18.8239 36.774 18.5312 37.3072L18.4766 37.4166L17.3691 39.834C18.0662 39.9256 18.7744 39.9821 19.4922 40L20 38.8914L20.5068 40C21.2249 39.9821 21.9335 39.9256 22.6309 39.834L21.5244 37.4166L21.4697 37.3072C21.1966 36.8096 20.689 36.4842 20.123 36.4428ZM21 12.4063V0H19V12.4063L15.7891 0.422921L13.8574 0.940585L17.0674 12.923L10.8662 2.18005L9.13379 3.18021L15.335 13.9222L6.56543 5.15124L5.15039 6.56651L13.9199 15.3375L3.17969 9.13529L2.17969 10.868L12.9209 17.0702L0.94043 13.8597L0.422852 15.7917L12.4053 19.0031H0V21.0035H12.4053L0.422852 24.2149L0.94043 26.1469L12.9209 22.9354L2.17969 29.1386L3.17969 30.8713L13.9199 24.6681L5.15039 33.4401L6.56543 34.8554L13.1216 28.2964C13.684 27.7337 14 26.9706 14 26.175V20.435C14 17.1209 16.6865 14.4342 20 14.434C23.3137 14.434 26 17.1208 26 20.435V26.1759C26 26.9716 26.316 27.7347 26.8785 28.2974L33.4346 34.8554L34.8496 33.4401L26.0801 24.6691L36.8203 30.8713L37.8203 29.1386L27.0791 22.9354L39.0596 26.1469L39.5771 24.2149L27.5957 21.0035H40V19.0031H27.5947L39.5771 15.7917L39.0596 13.8597L27.0791 17.0692L37.8203 10.868L36.8203 9.13529L26.0781 15.3375L34.8496 6.56554L33.4355 5.15124L24.6641 13.9232L30.8662 3.18021L29.1338 2.18005L22.9316 12.923L26.1426 0.940585L24.2109 0.422921L21 12.4063ZM20 32.4372C18.0122 32.4374 16.1792 33.5112 15.207 35.2453L13.2021 38.8201C13.8407 39.051 14.4942 39.2501 15.1611 39.4159L16.9512 36.224C17.5694 35.1209 18.7357 34.4377 20 34.4376C21.2645 34.4376 22.4305 35.1208 23.0488 36.224L24.8379 39.4159C25.5048 39.2502 26.1583 39.0509 26.7969 38.8201L24.793 35.2453C23.8208 33.5111 21.9879 32.4372 20 32.4372Z" fill="#000"></path>
             </svg>
            <span> AcadSync</span>
            </Link>
        <div className="text-sm font-bold">
          STEP {step} OF 4
        </div>
      </header>

      <main className="flex-1 flex flex-col md:flex-row">
        {/* Left Panel: Context/Summary - Hidden on mobile, visible on medium+ screens */}
        <div className="w-full md:w-1/3 bg-gray-50 p-8 md:p-12 border-b md:border-b-0 md:border-r border-black hidden md:block">
          <h1 className="text-4xl md:text-5xl font-display mb-6">
            {step === 1 && "Start your journey."}
            {step === 2 && "Choose your power."}
            {step === 3 && "Secure Check."}
            {step === 4 && "Final Confirmation."}
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            {step === 1 && "Create your account to streamline your institution's management."}
            {step === 2 && "Select a plan that scales with your needs. Change anytime."}
            {step === 3 && "Verified payments securely via our partners. Mock inputs accepted."}
            {step === 4 && "Review your details and confirm subscription."}
          </p>

          <ul className="space-y-4">
            <li className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full border border-black flex items-center justify-center ${step >= 1 ? 'bg-black text-white' : ''}`}>1</div>
              <span className={step === 1 ? 'font-bold' : ''}>Account Details</span>
            </li>
            <li className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full border border-black flex items-center justify-center ${step >= 2 ? 'bg-black text-white' : ''}`}>2</div>
              <span className={step === 2 ? 'font-bold' : ''}>Subscription</span>
            </li>
            <li className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full border border-black flex items-center justify-center ${step >= 3 ? 'bg-black text-white' : ''}`}>3</div>
              <span className={step === 3 ? 'font-bold' : ''}>Payment</span>
            </li>
            <li className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full border border-black flex items-center justify-center ${step >= 4 ? 'bg-black text-white' : ''}`}>4</div>
              <span className={step === 4 ? 'font-bold' : ''}>Confirm</span>
            </li>
          </ul>
        </div>

        {/* Right Panel: Active Step */}
        <div className="w-full md:w-2/3 p-6 md:p-20 flex flex-col justify-center min-h-[60vh] md:min-h-0">
          
          {/* Mobile Step Indicator - Visible only on mobile */}
          <div className="md:hidden mb-8 text-center">
             <h2 className="text-2xl font-display mb-2">
                {step === 1 && "Start your journey."}
                {step === 2 && "Choose your power."}
                {step === 3 && "Secure Check."}
                {step === 4 && "Final Confirmation."}
             </h2>
             <div className="flex justify-center gap-2">
                {[1, 2, 3, 4].map(s => (
                    <div key={s} className={`h-1.5 rounded-full transition-all ${s === step ? 'w-8 bg-black' : 'w-2 bg-gray-300'}`} />
                ))}
            </div>
          </div>
          
          {/* STEP 1: User Details */}
          {step === 1 && (
            <form onSubmit={handleSubmit(onStep1Submit)} className="max-w-md w-full mx-auto space-y-6">
              <h2 className="text-3xl font-display mb-6">Enter Details</h2>
              <Input
                label="Full Name"
                placeholder="John Doe"
                error={errors.name?.message}
                {...register('name')}
                className="rounded-none border-black focus:ring-0 focus:border-black shadow-none border-b-2 border-t-0 border-x-0 px-0 bg-transparent"
              />
              <Input
                label="Email"
                type="email"
                placeholder="john@example.com"
                error={errors.email?.message}
                {...register('email')}
                className="rounded-none border-black focus:ring-0 focus:border-black shadow-none border-b-2 border-t-0 border-x-0 px-0 bg-transparent"
              />
              <Input
                label="Phone"
                placeholder="9876543210"
                error={errors.phoneNumber?.message}
                {...register('phoneNumber')}
                className="rounded-none border-black focus:ring-0 focus:border-black shadow-none border-b-2 border-t-0 border-x-0 px-0 bg-transparent"
              />
               <div className="flex flex-col space-y-1">
                <label className="text-sm font-bold uppercase tracking-wider text-black">Organization Type</label>
                <select
                  {...register('organizationType')}
                  className="px-0 py-2 border-b-2 border-black rounded-none bg-transparent text-black focus:outline-none focus:border-black"
                >
                  <option value="">Select Type</option>
                  <option value="School">School</option>
                  <option value="College">College</option>
                  <option value="University">University</option>
                  <option value="Other">Other</option>
                </select>
                {errors.organizationType && <span className="text-sm text-red-500">{errors.organizationType.message}</span>}
              </div>
              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                error={errors.password?.message}
                {...register('password')}
                className="rounded-none border-black focus:ring-0 focus:border-black shadow-none border-b-2 border-t-0 border-x-0 px-0 bg-transparent"
              />
              
              <div className="pt-6">
                <Button type="submit" className="w-full h-14 bg-black text-white hover:bg-neutral-800 text-lg">
                  Next Step <ChevronRight className="ml-2 w-5 h-5" />
                </Button>
              </div>
            </form>
          )}

          {/* STEP 2: Plan Selection */}
          {step === 2 && (
             <div className="max-w-5xl w-full mx-auto">
                <h2 className="text-3xl font-display mb-4 text-center">Select your plan</h2>
                
                {/* Billing Cycle Toggle */}
                <div className="flex justify-center mb-10">
                    <div className="inline-flex items-center p-1 bg-gray-100 border border-black rounded-none">
                        <button 
                            onClick={() => setBillingCycle('monthly')}
                            className={`px-6 py-2 text-sm font-bold uppercase transition-all ${billingCycle === 'monthly' ? 'bg-black text-white' : ' bg-amber-50 text-gray-500 hover:text-black'}`}
                        >
                            Monthly
                        </button>
                        <button 
                            onClick={() => setBillingCycle('yearly')}
                            className={`px-6 py-2 text-sm font-bold uppercase transition-all ${billingCycle === 'yearly' ? 'bg-black text-white' : 'text-gray-500 hover:text-black'}`}
                        >
                            Yearly <span className="ml-1 text-[10px] text-green-600">(Save 20%)</span>
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Individual Plan */}
                  <div className="border border-black p-8 flex flex-col hover:bg-black hover:text-white transition-all group relative">
                    <h3 className="text-xl font-bold mb-2">Individual</h3>
                    <div className="text-3xl font-display mb-6">
                        ₹{(billingCycle === 'monthly' ? plans[0].price : plans[0].yearlyPrice).toLocaleString()}
                        <span className="text-sm font-body font-normal opacity-70">/{billingCycle === 'monthly' ? 'mo' : 'yr'}</span>
                    </div>
                    <ul className="space-y-2 mb-8 flex-1">
                      <li className="text-sm flex items-center">• 1 Portal Limit</li>
                      <li className="text-sm flex items-center">• Basic Analytics</li>
                      <li className="text-sm flex items-center">• Standard Support</li>
                    </ul>
                    <select 
                        onChange={(e) => {
                            if(e.target.value) handlePlanSelect('individual', [e.target.value]);
                        }}
                        className="w-full py-2 border border-black bg-white text-black text-sm font-bold uppercase px-2 focus:outline-none"
                    >
                        <option value="">Choose Role</option>
                        <option value="student">Student</option>
                        <option value="teacher">Teacher</option>
                        <option value="school">Admin</option>
                    </select>
                  </div>

                  {/* Organization Plan */}
                  <div className="border border-black p-8 flex flex-col hover:bg-black hover:text-white transition-all group relative">
                    <h3 className="text-xl font-bold mb-2">Organization</h3>
                    <div className="text-3xl font-display mb-6">
                        ₹{(billingCycle === 'monthly' ? plans[1].price : plans[1].yearlyPrice).toLocaleString()}
                        <span className="text-sm font-body font-normal opacity-70">/{billingCycle === 'monthly' ? 'mo' : 'yr'}</span>
                    </div>
                    <ul className="space-y-2 mb-8 flex-1">
                      <li className="text-sm flex items-center">• Unlimited Portals</li>
                      <li className="text-sm flex items-center">• Student, Teacher & School Access</li>
                      <li className="text-sm flex items-center">• Advanced Analytics</li>
                      <li className="text-sm flex items-center">• Priority Support</li>
                    </ul>
                    <button 
                        onClick={() => handlePlanSelect('organization')}
                        className="w-full py-2 border border-black group-hover:border-white text-sm font-bold uppercase"
                    >
                      choose
                    </button>
                  </div>

                  {/* Custom Plan */}
                  <div className="border border-black p-8 flex flex-col hover:bg-black hover:text-white transition-all group relative">
                    <h3 className="text-xl font-bold mb-2">Custom</h3>
                    <div className="text-3xl font-display mb-6">
                        ₹{calculatePrice('custom', billingCycle, selectedRoles).toLocaleString()}
                        <span className="text-sm font-body font-normal opacity-70">/{billingCycle === 'monthly' ? 'mo' : 'yr'}</span>
                    </div>
                    <ul className="space-y-2 mb-8 flex-1">
                      <li className="text-sm flex items-center">• Custom Integrations</li>
                      <li className="text-sm flex items-center">• Dedicated Manager</li>
                      <li className="text-sm flex items-center">• Flexible Roles</li>
                    </ul>
                     <div className="relative">
                        {selectedPlan === 'custom' ? (
                            <div className="bg-white text-black p-4 border border-black absolute bottom-0 left-0 right-0 shadow-lg z-10">
                                <h4 className="font-bold mb-2 text-sm">Select Roles:</h4>
                                <div className="space-y-2 mb-4">
                                    {['student', 'teacher', 'school'].map(role => (
                                        <label key={role} className="flex items-center space-x-2 cursor-pointer">
                                            <input 
                                                type="checkbox" 
                                                checked={selectedRoles.includes(role)}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setSelectedRoles([...selectedRoles, role]);
                                                    } else {
                                                        setSelectedRoles(selectedRoles.filter(r => r !== role));
                                                    }
                                                }}
                                                className="form-checkbox h-4 w-4 text-black border-black focus:ring-0"
                                            />
                                            <span className="uppercase text-xs font-bold w-full flex justify-between">
                                                <span>{role}</span>
                                                <span className="text-gray-500 ml-2">+₹{(rolePrice * (billingCycle === 'yearly' ? 10 : 1)).toLocaleString()}</span>
                                            </span>
                                        </label>
                                    ))}
                                </div>
                                <button 
                                    onClick={() => setStep(3)}
                                    // disabled={selectedRoles.length === 0} // Allow no roles? Maybe strict base price. Let's keep disabled if they need at least one? No, maybe base price is enough. But user probably wants roles. Let's keep it but maybe warn? 
                                    // Actually, if custom is just for roles, we should require at least one or just let base allow it.
                                    // Let's keep disabled logic for now but maybe user wants it.
                                    disabled={selectedRoles.length === 0}
                                    className="w-full py-2 bg-black text-white text-sm font-bold uppercase disabled:opacity-50"
                                >
                                    Confirm
                                </button>
                            </div>
                        ) : (
                            <button 
                                className="w-full py-2 border border-black group-hover:border-white text-sm font-bold uppercase"
                                onClick={(e) => {
                                    e.stopPropagation(); // Prevent triggering parent click if any
                                    setSelectedPlan('custom');
                                    // Don't reset selectedRoles if coming back, but if switching from another plan, maybe?
                                    // If we want to keep state, we shouldn't reset.
                                    // form logic says: setSelectedRoles([]); // Reset for custom selection
                                    // I will remove the reset if they are clicking customize to allow re-edit? 
                                    // No, the UI separates logic. Let's keep reset for now or they might carry over roles from partial selections.
                                    if (selectedPlan !== 'custom') setSelectedRoles(['teacher']); // Default to teacher 
                                }}
                            >
                                Customize
                            </button>
                        )}
                     </div>
                  </div>
                </div>
                <div className="mt-8 text-center">
                  <button onClick={() => setStep(1)} className="text-sm underline">Back to Details</button>
                </div>
             </div>
          )}

          {/* STEP 3: Payment Method & Inputs */}
          {step === 3 && (
            <div className="max-w-md w-full mx-auto">
              <h2 className="text-3xl font-display mb-6 text-center">Choose Payment Method</h2>
              
              <div className="bg-gray-50 p-6 mb-8 border border-black">
                <div className="flex justify-between items-center mb-4">
                  <span className="font-bold">Summary</span>
                  <div className="text-right">
                    <span className="text-sm uppercase block font-bold">{selectedPlan} Plan</span>
                    <span className="text-xs text-gray-500 uppercase">Billed {billingCycle}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center text-2xl font-display">
                  <span>Total</span>
                  <span>₹{calculatePrice(selectedPlan, billingCycle, selectedRoles).toLocaleString()}</span>
                </div>
                {selectedRoles.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-300">
                        <span className="text-sm font-bold">Roles Included:</span>
                        <div className="flex gap-2 mt-1">
                            {selectedRoles.map(role => (
                                <span key={role} className="text-xs bg-black text-white px-2 py-1 uppercase">{role}</span>
                            ))}
                        </div>
                    </div>
                )}
              </div>

              <div className="space-y-4">
                {paymentMethods.map((method) => (
                  <div key={method.id} className="border border-black transition-all">
                    {/* Header / Trigger */}
                    <div 
                      onClick={() => setPaymentMethod(method.id === paymentMethod ? null : method.id as any)}
                      className={`p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 ${paymentMethod === method.id ? 'bg-gray-100' : ''}`}
                    >
                      <div className="flex items-center gap-4">
                        <method.icon className="w-6 h-6" />
                        <span className="text-lg font-bold">{method.name}</span>
                      </div>
                      <ChevronRight className={`w-5 h-5 transition-transform ${paymentMethod === method.id ? 'rotate-90' : ''}`} />
                    </div>

                    {/* Dropdown Content */}
                    {paymentMethod === method.id && (
                      <div className="p-4 border-t border-black bg-white animation-slide-down">
                        {method.id === 'card' && (
                          <div className="space-y-4">
                            <div className="border border-black p-3 flex items-center gap-3">
                              <CreditCard className="w-5 h-5 text-gray-500" />
                              <input 
                                type="text" 
                                placeholder="Card Number" 
                                className="flex-1 outline-none bg-transparent font-mono text-sm" 
                                value={cardDetails.number}
                                onChange={(e) => setCardDetails({...cardDetails, number: e.target.value.replace(/\D/g, '').slice(0, 16)})}
                                maxLength={16}
                              />
                            </div>
                            <div className="flex gap-4">
                              <div className="border border-black p-3 flex-1">
                                <input 
                                    type="text" 
                                    placeholder="MM/YY" 
                                    className="w-full outline-none bg-transparent font-mono text-sm" 
                                    value={cardDetails.expiry}
                                    onChange={(e) => setCardDetails({...cardDetails, expiry: e.target.value})}
                                    maxLength={5}
                                />
                              </div>
                              <div className="border border-black p-3 flex-1">
                                <input 
                                    type="text" 
                                    placeholder="CVC" 
                                    className="w-full outline-none bg-transparent font-mono text-sm" 
                                    value={cardDetails.cvc}
                                    onChange={(e) => setCardDetails({...cardDetails, cvc: e.target.value.replace(/\D/g, '').slice(0, 3)})}
                                    maxLength={3}
                                />
                              </div>
                            </div>
                          </div>
                        )}

                        {method.id === 'upi' && (
                          <div className="space-y-4">
                            <div className="border border-black p-3 flex items-center gap-3">
                              <ShieldCheck className="w-5 h-5 text-gray-500" />
                              <input 
                                type="text" 
                                placeholder="UPI ID" 
                                className="flex-1 outline-none bg-transparent font-mono text-sm" 
                                value={upiId}
                                onChange={(e) => setUpiId(e.target.value)}
                              />
                              {(upiId.includes('@')) && <span className="text-xs font-bold text-green-600">VALID</span>}
                            </div>
                          </div>
                        )}

                         {method.id === 'netbanking' && (
                          <div className="text-sm text-gray-500 italic">
                            Redirects to bank portal...
                          </div>
                        )}

                        {paymentError && <div className="text-red-500 text-sm font-bold mt-2">{paymentError}</div>}

                        <div className="mt-6">
                           <Button onClick={handleStep3Submit} className="w-full h-12 bg-black text-white hover:bg-neutral-800 flex items-center justify-center gap-2">
                            Review Order
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
               
              <div className="mt-8 text-center">
                <button onClick={() => setStep(2)} className="text-sm underline">Back to Plans</button>
              </div>
            </div>
          )}

          {/* STEP 4: Submit & Confirm */}
          {step === 4 && (
            <div className="max-w-md w-full mx-auto text-center">
              <h2 className="text-3xl font-display mb-8">Confirm Subscription</h2>

              <div className="border border-black p-8 mb-8 text-left bg-gray-50">
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Plan</span>
                    <span className="font-bold uppercase">{selectedPlan}</span>
                  </div>
                   <div className="flex justify-between">
                    <span className="text-gray-600">Cycle</span>
                    <span className="font-bold uppercase">{billingCycle}</span>
                  </div>
                   <div className="flex justify-between">
                    <span className="text-gray-600">Payment Method</span>
                    <span className="font-bold uppercase">{paymentMethod}</span>
                  </div>
                  {selectedRoles.length > 0 && (
                    <div className="flex justify-between">
                        <span className="text-gray-600">Roles</span>
                        <div className="flex flex-col items-end">
                            {selectedRoles.map(role => (
                                <span key={role} className="font-bold uppercase text-sm">{role}</span>
                            ))}
                        </div>
                    </div>
                  )}
                  <div className="border-t border-black pt-4 flex justify-between text-xl font-display">
                    <span>Total Amount</span>
                    <span>₹{calculatePrice(selectedPlan, billingCycle, selectedRoles).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <Button 
                onClick={handleFinalPayment} 
                disabled={isProcessing}
                className="w-full h-14 bg-black text-white hover:bg-neutral-800 text-lg flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <>Processing Payment...</>
                ) : (
                  <>Pay & Subscribe <ChevronRight className="w-5 h-5" /></>
                )}
              </Button>

              <div className="mt-6">
                 {!isProcessing && (
                  <button onClick={() => setStep(3)} className="text-sm underline">Back to Payment</button>
                 )}
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
};

export default Register;
