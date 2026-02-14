import { useState, useEffect } from 'react';
import api from '../services/api'; // Use configured axios instance
import { Users, CreditCard, LayoutGrid, Save, Loader2, Trash2 } from 'lucide-react';
import Button from '../components/Button';
import toast from 'react-hot-toast';
import ConfirmationModal from '../components/ConfirmationModal';

interface UserData {
    _id: string;
    name: string;
    email: string;
    role: string;
    subscription: {
        plan: string;
        status: string;
        finalPrice: number;
    } | null;
}

interface PricingConfig {
    plans: {
        individual: { monthly: number; yearly: number };
        organization: { monthly: number; yearly: number };
        custom: { monthly: number; yearly: number };
    };
    rolePrice: number;
}

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState<'users' | 'pricing'>('users');
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  
  // Pricing State
  const [pricing, setPricing] = useState<PricingConfig | null>(null);
  const [savingPricing, setSavingPricing] = useState(false);

  useEffect(() => {
      fetchData();
  }, [activeTab]);

  const fetchData = async () => {
      setLoading(true);
      try {
          if (activeTab === 'users') {
              const { data } = await api.get('/admin/users');
              setUsers(data);
          } else {
              const { data } = await api.get('/admin/pricing');
              setPricing(data);
          }
      } catch (error) {
          toast.error('Failed to fetch data');
      } finally {
          setLoading(false);
      }
  };

  const handlePricingChange = (path: string, value: string) => {
      if (!pricing) return;
      const numValue = parseInt(value) || 0;
      
      const newPricing = { ...pricing };
      const keys = path.split('.');
      
      if (keys.length === 1) {
          (newPricing as any)[keys[0]] = numValue;
      } else if (keys.length === 2) {
           // @ts-ignore
          newPricing.plans[keys[0]][keys[1]] = numValue;
      } else if (keys.length === 3) {
           // @ts-ignore
          newPricing.plans[keys[0]][keys[1]][keys[2]] = numValue; // Not used here but safe
      }
      
      setPricing(newPricing);
  };

  const savePricing = async () => {
      if (!pricing) return;
      setSavingPricing(true);
      try {
          await api.put('/admin/pricing', pricing);
          toast.success('Pricing updated successfully');
      } catch (error) {
          toast.error('Failed to update pricing');
      } finally {
          setSavingPricing(false);
      }
  };

  // Derived Stats
  const totalUsers = users.length;
  // Calculate revenue from active subscriptions (simplified)
  // Real app would sum actual payments table
  const totalRevenue = users.reduce((acc, user) => acc + (user.subscription?.finalPrice || 0), 0);
  const activeSubs = users.filter(u => u.subscription?.status === 'active').length;

  const filteredUsers = users.filter(user => {
      if (filter === 'All') return true;
      return user.subscription?.plan === filter.toLowerCase();
  });

  // Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const confirmDeleteUser = (userId: string) => {
      setUserToDelete(userId);
      setDeleteModalOpen(true);
  };

  const handleExecuteDelete = async () => {
      if (!userToDelete) return;
      setIsDeleting(true);
      try {
          await api.delete(`/admin/users/${userToDelete}`);
          toast.success('User deleted successfully');
          fetchData(); 
          setDeleteModalOpen(false);
          setUserToDelete(null);
      } catch (error) {
          toast.error('Failed to delete user');
      } finally {
          setIsDeleting(false);
      }
  };

  if (loading && users.length === 0 && !pricing) {
      return <div className="flex justify-center p-12"><Loader2 className="animate-spin" /></div>;
  }


  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6">
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2 font-display">
            Admin Overview
            </h1>
            <p className="text-gray-500">
            Manage users, subscriptions and revenue.
            </p>
        </div>
        <div className="flex bg-gray-100 rounded-lg p-1 gap-2 w-full md:w-auto">
            <button 
                onClick={() => setActiveTab('users')}
                className={`flex-1 md:flex-none px-4 py-2 rounded-md text-sm font-bold transition-all ${activeTab === 'users' ? 'bg-white shadow text-black' : 'text-gray-500 hover:text-black'}`}
            >
                Users
            </button>
            <button 
                onClick={() => setActiveTab('pricing')}
                className={`flex-1 md:flex-none px-4 py-2 rounded-md text-sm font-bold transition-all ${activeTab === 'pricing' ? 'bg-white shadow text-black' : 'text-gray-500 hover:text-black'}`}
            >
                Pricing
            </button>
        </div>
      </div>

      {activeTab === 'users' ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <div className="bg-black text-white p-6 rounded shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-400">Total Users</p>
                        <h3 className="text-2xl font-bold mt-1">{totalUsers}</h3>
                    </div>
                    <div className="bg-neutral-800 p-3 rounded-lg text-white">
                        <Users size={24} />
                    </div>
                </div>
                </div>
                <div className="bg-black text-white p-6 rounded shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-400">Est. Revenue (Active)</p>
                        <h3 className="text-2xl font-bold mt-1">₹{(totalRevenue / 100000).toFixed(2)}L</h3>
                    </div>
                    <div className="bg-neutral-800 p-3 rounded-lg text-white">
                        <CreditCard size={24} />
                    </div>
                </div>
                </div>
                <div className="bg-black text-white p-6 rounded shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-400">Active Subscriptions</p>
                        <h3 className="text-2xl font-bold mt-1">{activeSubs}</h3>
                    </div>
                    <div className="bg-neutral-800 p-3 rounded-lg text-white">
                        <LayoutGrid size={24} />
                    </div>
                </div>
                </div>
            </div>

            <div className="bg-white rounded border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <h3 className="font-semibold text-gray-900">Recent Users</h3>
                    <select 
                        className="w-full sm:w-auto bg-gray-50 border border-gray-300 rounded text-sm px-3 py-1.5 focus:ring-2 focus:ring-black outline-none"
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                    >
                        <option value="All">All Plans</option>
                        <option value="Individual">Individual</option>
                        <option value="Organization">Organization</option>
                        <option value="Custom">Custom</option>
                    </select>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-600 min-w-[800px]">
                        <thead className="bg-gray-50 text-xs uppercase font-semibold text-gray-500">
                            <tr>
                                <th className="px-6 py-4">User</th>
                                <th className="px-6 py-4">Email</th>
                                <th className="px-6 py-4">Plan</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Price Paid</th>
                                <th className="px-6 py-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredUsers.map((user) => (
                                <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 font-bold text-gray-900">{user.name}</td>
                                    <td className="px-6 py-4">{user.email}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                                            !user.subscription ? 'bg-gray-100 text-gray-500' :
                                            user.subscription.plan === 'organization' ? 'bg-purple-100 text-purple-700' :
                                            user.subscription.plan === 'individual' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'
                                        }`}>
                                            {user.subscription?.plan || 'None'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {user.subscription?.status === 'active' ? (
                                             <span className="px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold">Active</span>
                                        ) : (
                                            <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-500 text-xs font-bold">Inactive</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 font-mono">
                                        {user.subscription ? `₹${user.subscription.finalPrice.toLocaleString()}` : '-'}
                                    </td>
                                    <td className="px-6 py-4">
                                        <button 
                                            onClick={() => confirmDeleteUser(user._id)}
                                            className="text-red-600 hover:text-red-900"
                                            title="Delete User"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {filteredUsers.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-gray-400">No users found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
          </>
      ) : (
          <div className="bg-white p-6 md:p-8 border border-gray-200 rounded max-w-4xl mx-auto">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <h3 className="text-xl font-bold">Subscription Pricing Configuration</h3>
                <Button onClick={savePricing} disabled={savingPricing} className="flex items-center gap-2 w-full sm:w-auto justify-center">
                    {savingPricing ? <Loader2 size={16} className="animate-spin"/> : <Save size={16}/>}
                    Save Changes
                </Button>
              </div>

              {pricing && (
                  <div className="space-y-8">
                       {/* Individual Plan */}
                       <div className="p-6 border border-gray-200 rounded-lg">
                           <h4 className="font-bold text-lg mb-4 flex items-center gap-2">
                               <span className="w-3 h-3 bg-blue-500 rounded-full"></span> Individual Plan
                           </h4>
                           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                               <div>
                                   <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Monthly Price (₹)</label>
                                   <input 
                                        type="number" 
                                        value={pricing?.plans.individual.monthly || 0}
                                        onChange={(e) => handlePricingChange('individual.monthly', e.target.value)}
                                        className="w-full p-2 border border-black rounded font-mono"
                                   />
                               </div>
                               <div>
                                   <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Yearly Price (₹)</label>
                                   <input 
                                        type="number" 
                                        value={pricing?.plans.individual.yearly || 0}
                                        onChange={(e) => handlePricingChange('individual.yearly', e.target.value)}
                                        className="w-full p-2 border border-black rounded font-mono"
                                   />
                               </div>
                           </div>
                       </div>

                       {/* Organization Plan */}
                       <div className="p-6 border border-gray-200 rounded-lg">
                           <h4 className="font-bold text-lg mb-4 flex items-center gap-2">
                               <span className="w-3 h-3 bg-purple-500 rounded-full"></span> Organization Plan
                           </h4>
                           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                               <div>
                                   <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Monthly Price (₹)</label>
                                   <input 
                                        type="number" 
                                        value={pricing?.plans.organization.monthly || 0}
                                        onChange={(e) => handlePricingChange('organization.monthly', e.target.value)}
                                        className="w-full p-2 border border-black rounded font-mono"
                                   />
                               </div>
                               <div>
                                   <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Yearly Price (₹)</label>
                                   <input 
                                        type="number" 
                                        value={pricing?.plans.organization.yearly || 0}
                                        onChange={(e) => handlePricingChange('organization.yearly', e.target.value)}
                                        className="w-full p-2 border border-black rounded font-mono"
                                   />
                               </div>
                           </div>
                       </div>

                       {/* Custom / Role Base */}
                       <div className="p-6 border border-gray-200 rounded-lg">
                           <h4 className="font-bold text-lg mb-4 flex items-center gap-2">
                               <span className="w-3 h-3 bg-orange-500 rounded-full"></span> Custom & Roles
                           </h4>
                           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                               <div>
                                   <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Base Role Price (₹)</label>
                                   <p className="text-xs text-gray-400 mb-2">Cost per role for Custom Plan</p>
                                   <input 
                                        type="number" 
                                        value={pricing?.rolePrice || 0}
                                        onChange={(e) => handlePricingChange('rolePrice', e.target.value)}
                                        className="w-full p-2 border border-black rounded font-mono"
                                   />
                               </div>
                           </div>
                       </div>
                  </div>
              )}
          </div>
      )}
      
      <ConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleExecuteDelete}
        title="Delete User?"
        message="Are you sure you want to delete this user? This action cannot be undone and will remove all their data."
        confirmText="Yes, Delete"
        isLoading={isDeleting}
      />
    </div>
  );
};
export default AdminDashboard;
