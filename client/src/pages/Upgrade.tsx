import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSubscription } from '../hooks/useSubscription';
import { CreditCard, ShieldCheck, ChevronRight, Loader2 } from 'lucide-react';
import Button from '../components/Button';
import toast from 'react-hot-toast';
import api from '../services/api'; // Assuming we might add an endpoint later, or just mock

const Upgrade = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { refreshSubscription } = useSubscription();
  const { plan, billingCycle, amount } = state || {};

  // Redirect if no state
  useEffect(() => {
    if (!plan || !billingCycle) {
      navigate('/my-purchases');
    }
  }, [plan, billingCycle, navigate]);

  const [paymentMethod, setPaymentMethod] = useState<'card' | 'upi' | null>(null);
  const [cardDetails, setCardDetails] = useState({ number: '', expiry: '', cvc: '' });
  const [upiId, setUpiId] = useState('');
  const [paymentError, setPaymentError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const validatePayment = () => {
    setPaymentError('');
    if (!paymentMethod) {
      setPaymentError('Please select a payment method');
      return false;
    }
    if (paymentMethod === 'card') {
      if (cardDetails.number.length < 16 || cardDetails.expiry.length < 5 || cardDetails.cvc.length < 3) {
        setPaymentError('Please enter valid card details');
        return false;
      }
    }
    if (paymentMethod === 'upi') {
      if (!upiId.includes('@')) {
        setPaymentError('Please enter a valid UPI ID');
        return false;
      }
    }
    return true;
  };

  const handleConfirmUpgrade = async () => {
      if (!validatePayment()) return;

      setIsProcessing(true);
      try {
          // Simulate API Call - Optional delay for UX
          // await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Call backend to update subscription
          await api.post('/subscription/upgrade', { 
            planId: plan.id, 
            billingCycle, 
            portalsIncluded: state?.roles,
            paymentMethod,
            amount 
          });

          await refreshSubscription(); // Refresh context state

          toast.success(`Successfully upgraded to ${plan?.name} (${billingCycle})!`);
          navigate('/dashboard');
      } catch (error) {
          toast.error('Upgrade failed. Please try again.');
      } finally {
          setIsProcessing(false);
      }
  };

  return (
    <div className="min-h-screen bg-white text-black font-body flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full">
            <h1 className="text-4xl font-display mb-2 text-center">Confirm Upgrade</h1>
            <p className="text-gray-500 text-center mb-8">Securely complete your purchase.</p>

            {/* Summary Card */}
            <div className="bg-gray-50 p-6 border border-black mb-8">
                <div className="flex justify-between items-center mb-4">
                    <span className="font-bold uppercase tracking-wider text-sm">New Plan</span>
                    <span className="font-bold text-xl">{plan?.name}</span>
                </div>
                 <div className="flex justify-between items-center mb-4">
                    <span className="font-bold uppercase tracking-wider text-sm">Billing Cycle</span>
                    <span className="font-bold capitalize">{billingCycle}</span>
                </div>
                {state?.roles && state.roles.length > 0 && (
                     <div className="mb-4 pt-4 border-t border-gray-300">
                        <span className="font-bold uppercase tracking-wider text-sm block mb-2">Roles Included</span>
                        <div className="flex gap-2 flex-wrap">
                            {state.roles.map((role: string) => (
                                <span key={role} className="text-xs bg-black text-white px-2 py-1 uppercase font-bold rounded-sm">
                                    {role}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
                <div className="border-t border-black pt-4 flex justify-between items-center">
                    <span className="font-bold text-lg">Total to Pay</span>
                    <span className="font-display text-3xl">₹{amount?.toLocaleString()}</span>
                </div>
            </div>

            {/* Payment Methods */}
            <div className="space-y-4 mb-8">
                 {/* Card */}
                 <div className={`border border-black transition-all ${paymentMethod === 'card' ? 'bg-gray-50' : ''}`}>
                    <div 
                        onClick={() => setPaymentMethod(paymentMethod === 'card' ? null : 'card')}
                        className="p-4 flex items-center justify-between cursor-pointer"
                    >
                        <div className="flex items-center gap-3">
                            <CreditCard className="w-5 h-5" />
                            <span className="font-bold">Credit/Debit Card</span>
                        </div>
                        <ChevronRight className={`w-5 h-5 transition-transform ${paymentMethod === 'card' ? 'rotate-90' : ''}`} />
                    </div>
                    {paymentMethod === 'card' && (
                        <div className="p-4 border-t border-black bg-white space-y-3 animate-in fade-in slide-in-from-top-2">
                             <div className="border border-black p-2 flex items-center gap-2">
                                <input 
                                    className="w-full outline-none text-sm font-mono" 
                                    placeholder="Card Number"
                                    maxLength={16}
                                    value={cardDetails.number}
                                    onChange={(e) => setCardDetails({...cardDetails, number: e.target.value.replace(/\D/g, '').slice(0, 16)})} 
                                />
                             </div>
                             <div className="flex gap-3">
                                <div className="border border-black p-2 flex-1">
                                    <input 
                                        className="w-full outline-none text-sm font-mono" 
                                        placeholder="MM/YY" 
                                        value={cardDetails.expiry}
                                        onChange={(e) => setCardDetails({...cardDetails, expiry: e.target.value})}
                                    />
                                </div>
                                <div className="border border-black p-2 flex-1">
                                    <input 
                                        className="w-full outline-none text-sm font-mono" 
                                        placeholder="CVC" 
                                        maxLength={3}
                                        value={cardDetails.cvc}
                                        onChange={(e) => setCardDetails({...cardDetails, cvc: e.target.value.replace(/\D/g, '').slice(0, 3)})}
                                    />
                                </div>
                             </div>
                        </div>
                    )}
                 </div>

                 {/* UPI */}
                 <div className={`border border-black transition-all ${paymentMethod === 'upi' ? 'bg-gray-50' : ''}`}>
                    <div 
                         onClick={() => setPaymentMethod(paymentMethod === 'upi' ? null : 'upi')}
                        className="p-4 flex items-center justify-between cursor-pointer"
                    >
                        <div className="flex items-center gap-3">
                            <ShieldCheck className="w-5 h-5" />
                            <span className="font-bold">UPI</span>
                        </div>
                         <ChevronRight className={`w-5 h-5 transition-transform ${paymentMethod === 'upi' ? 'rotate-90' : ''}`} />
                    </div>
                    {paymentMethod === 'upi' && (
                         <div className="p-4 border-t border-black bg-white animate-in fade-in slide-in-from-top-2">
                             <div className="border border-black p-2 flex items-center gap-2">
                                <input 
                                    className="w-full outline-none text-sm font-mono" 
                                    placeholder="Enter UPI ID" 
                                    value={upiId}
                                    onChange={(e) => setUpiId(e.target.value)}
                                />
                                {upiId.includes('@') && <span className="text-xs font-bold text-green-600">VALID</span>}
                             </div>
                         </div>
                    )}
                 </div>
            </div>

            {paymentError && <div className="text-red-600 font-bold text-center mb-4">{paymentError}</div>}

            <Button 
                onClick={handleConfirmUpgrade}
                disabled={isProcessing}
                className="w-full h-14 bg-black text-white hover:bg-neutral-800 text-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all flex items-center justify-center gap-2"
            >
                {isProcessing ? <Loader2 className="animate-spin" /> : 'Confirm & Pay'}
            </Button>
            
            <button 
                onClick={() => navigate('/my-purchases')}
                className="w-full mt-4 text-sm underline text-gray-500 hover:text-black"
            >
                Cancel
            </button>

        </div>
    </div>
  );
};

export default Upgrade;
