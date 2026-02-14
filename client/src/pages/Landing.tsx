import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, Mail, MapPin, Phone, Menu, X } from 'lucide-react'; 
import { usePricing } from '../hooks/usePricing'; // Use hook

const Landing = () => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { pricingConfig } = usePricing();

  const getPrice = (type: 'individual' | 'organization' | 'custom', cycle: 'monthly' | 'yearly') => {
      if (!pricingConfig) return '...';
      const val = pricingConfig.plans[type][cycle];
      if (type === 'custom') return 'Custom'; 
      return `₹${val.toLocaleString()}`;
  };

  const plans = [
    {
      name: 'Individual',
      role: 'For Tutors',
      price: { monthly: getPrice('individual', 'monthly'), yearly: getPrice('individual', 'yearly') },
      features: ['Single User Access', 'Basic Student Management', 'Email Support', '10GB Storage'],
    },
    {
      name: 'Organization',
      role: 'For Schools',
      price: { monthly: getPrice('organization', 'monthly'), yearly: getPrice('organization', 'yearly') },
      features: ['Unlimited Users', 'Advanced Analytics', 'Priority Support', 'Unlimited Storage', 'Custom Branding'],
    },
    {
      name: 'Custom',
      role: 'Universities',
      price: { monthly: 'Custom', yearly: 'Custom' },
      features: ['Tailored Solutions', 'Dedicated Account Manager', 'On-premise Deployment', 'SLA Guarantee'],
    }
  ];

  return (
    <div className="min-h-screen bg-white text-black flex flex-col font-body">
      {/* Navigation */}
      <nav className="flex justify-between items-center p-4 md:p-6 border-b border-black sticky top-0 bg-white z-50">
      <div className="flex items-center justify-center gap-3 md:gap-5">
          <svg width="24" height="24" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="md:w-[30px] md:h-[30px]">
            <path d="M20 28.4356C16.5306 28.4357 13.3035 30.2166 11.4521 33.1512L9.1543 36.7934L10.0371 37.3511C10.3132 37.5101 10.5937 37.6622 10.8779 37.8082L13.1436 34.2188C14.6285 31.8648 17.2171 30.437 20 30.4369C22.783 30.4369 25.3714 31.8647 26.8564 34.2188L29.1211 37.8082C29.4053 37.6623 29.6858 37.5101 29.9619 37.3511L30.8457 36.7934L28.5479 33.1512C26.6964 30.2165 23.4695 28.4356 20 28.4356ZM20.123 36.4428L20 36.4379C19.3855 36.4381 18.8239 36.774 18.5312 37.3072L18.4766 37.4166L17.3691 39.834C18.0662 39.9256 18.7744 39.9821 19.4922 40L20 38.8914L20.5068 40C21.2249 39.9821 21.9335 39.9256 22.6309 39.834L21.5244 37.4166L21.4697 37.3072C21.1966 36.8096 20.689 36.4842 20.123 36.4428ZM21 12.4063V0H19V12.4063L15.7891 0.422921L13.8574 0.940585L17.0674 12.923L10.8662 2.18005L9.13379 3.18021L15.335 13.9222L6.56543 5.15124L5.15039 6.56651L13.9199 15.3375L3.17969 9.13529L2.17969 10.868L12.9209 17.0702L0.94043 13.8597L0.422852 15.7917L12.4053 19.0031H0V21.0035H12.4053L0.422852 24.2149L0.94043 26.1469L12.9209 22.9354L2.17969 29.1386L3.17969 30.8713L13.9199 24.6681L5.15039 33.4401L6.56543 34.8554L13.1216 28.2964C13.684 27.7337 14 26.9706 14 26.175V20.435C14 17.1209 16.6865 14.4342 20 14.434C23.3137 14.434 26 17.1208 26 20.435V26.1759C26 26.9716 26.316 27.7347 26.8785 28.2974L33.4346 34.8554L34.8496 33.4401L26.0801 24.6691L36.8203 30.8713L37.8203 29.1386L27.0791 22.9354L39.0596 26.1469L39.5771 24.2149L27.5957 21.0035H40V19.0031H27.5947L39.5771 15.7917L39.0596 13.8597L27.0791 17.0692L37.8203 10.868L36.8203 9.13529L26.0781 15.3375L34.8496 6.56554L33.4355 5.15124L24.6641 13.9232L30.8662 3.18021L29.1338 2.18005L22.9316 12.923L26.1426 0.940585L24.2109 0.422921L21 12.4063ZM20 32.4372C18.0122 32.4374 16.1792 33.5112 15.207 35.2453L13.2021 38.8201C13.8407 39.051 14.4942 39.2501 15.1611 39.4159L16.9512 36.224C17.5694 35.1209 18.7357 34.4377 20 34.4376C21.2645 34.4376 22.4305 35.1208 23.0488 36.224L24.8379 39.4159C25.5048 39.2502 26.1583 39.0509 26.7969 38.8201L24.793 35.2453C23.8208 33.5111 21.9879 32.4372 20 32.4372Z" fill="#F97316"></path>
          </svg>
          <div className="text-xl md:text-2xl font-display italic">AcadSync</div>
      </div>
        
        <div className="hidden md:flex space-x-8">
          <Link to="/login" className="text-lg hover:italic transition-all">Login</Link>
          <Link to="/register" className="px-6 py-2 bg-black text-lg hover:bg-neutral-800 transition-colors">
            <span className='text-white'>Get Started</span>
          </Link>
        </div>

        {/* Mobile Menu Toggle */}
        <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden p-2">
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Mobile Menu Overlay */}
        {isMenuOpen && (
            <div className="absolute top-[72px] left-0 w-full bg-white border-b border-black md:hidden flex flex-col p-6 space-y-4 shadow-xl">
                <Link to="/login" className="text-xl font-bold p-2" onClick={() => setIsMenuOpen(false)}>Login</Link>
                 <Link to="/register" className="px-6 py-3 bg-black text-white text-xl text-center hover:bg-neutral-800 transition-colors" onClick={() => setIsMenuOpen(false)}>
                    Get Started
                </Link>
            </div>
        )}
      </nav>

      {/* Hero Section */}
      <main className="flex flex-col justify-center items-center text-center p-6 md:p-10 py-12 md:py-20 border-b border-black">
        <h1 className="text-5xl md:text-7xl lg:text-9xl mb-6 md:mb-8 font-display tracking-tighter text-black leading-[0.9]">
          Academic <br className="md:hidden" /> Excellence
        </h1>
        <p className="text-lg md:text-xl lg:text-2xl max-w-2xl mb-8 md:mb-12 font-light leading-relaxed px-4">
          Streamline your institution's workflow with our minimal, powerful management system.
          Designed for the modern educational landscape.
        </p>
        <div className="flex flex-col md:flex-row gap-4 md:gap-6 w-full md:w-auto px-6 md:px-0">
          <Link to="/register" className="px-8 md:px-10 py-3 md:py-4 bg-black text-white text-lg md:text-xl hover:bg-neutral-800 transition-all border border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] text-center">
            Get Started
          </Link>
          <Link to="/login" className="px-8 md:px-10 py-3 md:py-4 bg-white text-black text-lg md:text-xl border border-black hover:bg-neutral-50 transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] text-center">
             Client Login
          </Link>
        </div>
      </main>

      {/* Features Ticker */}
      <div className="bg-black text-white py-4 overflow-hidden whitespace-nowrap border-b border-black">
        <div className="animate-marquee inline-block">
          <span className="mx-8 text-2xl font-display italic">Student Management</span>
          <span className="mx-8 text-2xl font-display italic">•</span>
          <span className="mx-8 text-2xl font-display italic">Course Planning</span>
          <span className="mx-8 text-2xl font-display italic">•</span>
          <span className="mx-8 text-2xl font-display italic">Real-time Analytics</span>
          <span className="mx-8 text-2xl font-display italic">•</span>
          <span className="mx-8 text-2xl font-display italic">Seamless Integration</span>
          <span className="mx-8 text-2xl font-display italic">•</span>
          <span className="mx-8 text-2xl font-display italic">Teacher Management</span>
          <span className="mx-8 text-2xl font-display italic">•</span>
          <span className="mx-8 text-2xl font-display italic">School Management</span>
          <span className="mx-8 text-2xl font-display italic">•</span>
          <span className="mx-8 text-2xl font-display italic">Real-time Analytics</span>
          <span className="mx-8 text-2xl font-display italic">•</span>
          <span className="mx-8 text-2xl font-display italic">Seamless Integration</span>
          <span className="mx-8 text-2xl font-display italic">•</span>
        </div>
      </div>

      {/* Pricing Section */}
      <section className="py-12 md:py-20 px-4 md:px-6 border-b border-black bg-neutral-50">
          <div className="max-w-7xl mx-auto">
              <div className="text-center mb-10 md:mb-16">
                  <h2 className="text-4xl md:text-5xl font-display mb-4 md:mb-6 tracking-tight">Simple, Transparent Pricing</h2>
                  <p className="text-lg md:text-xl text-gray-600 mb-8">Choose the plan that fits your institution's needs.</p>
                  
                  {/* Toggle */}
                  <div className="inline-flex items-center p-1 bg-white border border-black rounded-full gap-2">
                      <button 
                        onClick={() => setBillingCycle('monthly')}
                        className={`px-4 md:px-6 py-2 rounded-full text-sm font-bold transition-all ${billingCycle === 'monthly' ? 'bg-black text-white' : 'text-gray-500 hover:text-black'}`}
                      >
                          Monthly
                      </button>
                      <button 
                        onClick={() => setBillingCycle('yearly')}
                        className={`px-4 md:px-6 py-2 rounded-full text-sm font-bold transition-all ${billingCycle === 'yearly' ? 'bg-black text-white' : 'text-gray-500 hover:text-black'}`}
                      >
                          Yearly <span className="ml-1 text-[10px] text-green-500">(Save 20%)</span>
                      </button>
                  </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                  {plans.map((plan) => (
                      <div key={plan.name} className="bg-white border-2 border-black p-6 md:p-8 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[-4px] transition-transform duration-300 flex flex-col">
                          <div className="mb-4">
                              <span className="text-xs font-bold uppercase tracking-wider bg-gray-100 px-2 py-1 rounded">{plan.role}</span>
                              <h3 className="text-2xl md:text-3xl font-bold mt-2">{plan.name}</h3>
                          </div>
                          <div className="mb-8">
                              <span className="text-3xl md:text-4xl font-display">{plan.price[billingCycle]}</span>
                              {plan.price[billingCycle] !== 'Custom' && <span className="text-gray-500">/{billingCycle === 'monthly' ? 'mo' : 'yr'}</span>}
                          </div>
                          <ul className="mb-8 space-y-4 flex-1">
                              {plan.features.map((feature) => (
                                  <li key={feature} className="flex items-start">
                                      <CheckCircle size={20} className="mr-3 shrink-0" />
                                      <span className="text-sm font-medium">{feature}</span>
                                  </li>
                              ))}
                          </ul>
                          <Link to={`/register?plan=${plan.name.toLowerCase()}`} className="w-full block py-3 bg-black text-white text-center font-bold uppercase hover:bg-neutral-800 transition-colors border border-black no-underline">
                              <span className="text-white">Choose {plan.name}</span>
                          </Link>
                      </div>
                  ))}
              </div>
          </div>
      </section>

      {/* Footer / Contact */}
      <footer className="bg-black text-white py-16 px-6">
          <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-12">
              <div className="col-span-1 md:col-span-2">
                  <h4 className="text-3xl font-display italic mb-6">AcadSync</h4>
                  <p className="text-gray-400 max-w-sm mb-6">
                      Empowering educational institutions with next-generation management tools. 
                      Simple, secure, and scalable.
                  </p>
                  <div className="flex space-x-4">
                      {/* Social placeholders */}
                      <div className="w-10 h-10 bg-white/10 rounded-full hover:bg-white/20 cursor-pointer"></div>
                      <div className="w-10 h-10 bg-white/10 rounded-full hover:bg-white/20 cursor-pointer"></div>
                      <div className="w-10 h-10 bg-white/10 rounded-full hover:bg-white/20 cursor-pointer"></div>
                  </div>
              </div>
              
              <div>
                  <h5 className="font-bold text-lg mb-6 uppercase tracking-wider">Contact</h5>
                  <ul className="space-y-4 text-gray-400">
                      <li className="flex items-center">
                          <Mail size={18} className="mr-3 shrink-0" />
                          <span>support@acadsync.com</span>
                      </li>
                      <li className="flex items-center">
                          <Phone size={18} className="mr-3 shrink-0" />
                          <span>+91 98765 43210</span>
                      </li>
                      <li className="flex items-start">
                          <MapPin size={18} className="mr-3 mt-1 shrink-0" />
                          <span>123 Education Lane,<br/>Tech City, Bangalore</span>
                      </li>
                  </ul>
              </div>

              <div>
                  <h5 className="font-bold text-lg mb-6 uppercase tracking-wider">Legal</h5>
                  <ul className="space-y-4 text-gray-400">
                      <li><a href="#" className="text-gray-400 hover:text-white transition-colors no-underline">Privacy Policy</a></li>
                      <li><a href="#" className="text-gray-400 hover:text-white transition-colors no-underline">Terms of Service</a></li>
                      <li><a href="#" className="text-gray-400 hover:text-white transition-colors no-underline">Cookie Policy</a></li>
                  </ul>
              </div>
          </div>
          <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-white/20 text-center text-gray-500 text-sm">
              © {new Date().getFullYear()} AcadSync. All rights reserved.
          </div>
      </footer>
    </div>
  );
};

export default Landing;
