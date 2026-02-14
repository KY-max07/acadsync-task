import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useSubscription } from '../hooks/useSubscription';
import { Box, CreditCard, Calendar, Activity, ArrowRight } from 'lucide-react';
import Button from '../components/Button';
import AdminDashboard from './AdminDashboard';

const Dashboard = () => {
  const { subscription, loading } = useSubscription();
  const { user } = useAuth();
  const navigate = useNavigate();

  if (loading) {
    return <div className="p-8">Loading ...</div>;
  }

  if (user?.role === 'admin') {
      return <AdminDashboard />;
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900  mb-2 font-display ">
          Hello, {user?.name}
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          Here's an overview of your account
        </p>
      </div>

      {!subscription ? (
        <div className="bg-black rounded p-8 text-center shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-indigo-600 dark:text-indigo-400">
             <CreditCard size={32} />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">No Active Subscription</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
            You haven't subscribed to any plan yet. Choose a plan to get started with AcadSync portals.
          </p>
          <Button onClick={() => navigate('/pricing')}>
            View Plans
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Subscription Status Card */}
          <div className="bg-black rounded p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-700 ">Current Plan</h3>
              <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${
                subscription.status === 'active' 
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' 
                  : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
              }`}>
                {subscription.status}
              </span>
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white capitalize mb-1">
              {subscription.subscriptionType}
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              ₹{subscription.finalPrice}/month
            </p>
            <div className="space-y-3">
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                <Calendar size={16} className="mr-2 opacity-70" />
                <span>Renews on {new Date(subscription.endDate).toLocaleDateString()}</span>
              </div>
            </div>
            <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-700">
               <Button variant="outline" className="w-full text-sm" onClick={() => navigate('/my-purchases')}>
                 Manage Subscription
               </Button>
            </div>
          </div>

          {/* Active Portals Card */}
          <div className="bg-black rounded p-6 shadow-sm border border-gray-200 dark:border-gray-700 md:col-span-2">
            <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold text-gray-700 dark:text-gray-300">Active Portals</h3>
                <Activity size={20} className="text-gray-400" />
            </div>
            <div className="grid sm:grid-cols-3 gap-4">
               {subscription.portalsIncluded.map((portal) => (
                 <div key={portal} className="bg-neutral-800 p-4 text-white rounded">
                    <div className="bg-indigo-100 dark:bg-indigo-900/30 w-10 h-10 rounded-lg flex items-center justify-center mb-3 text-indigo-600 dark:text-indigo-400">
                        <Box size={20} />
                    </div>
                    <h4 className="font-semibold text-gray-200  capitalize mb-1">{portal}</h4>
                    <div className="text-xs text-green-600 dark:text-green-400 flex items-center">
                        Active <span className="w-1.5 h-1.5 bg-green-500 rounded-full ml-1.5"></span>
                    </div>
                    <button className="mt-4 text-sm text-indigo-600 dark:text-indigo-400 font-medium flex items-center hover:underline" onClick={() => navigate(`/${portal}`)}>
                        Access Portal <ArrowRight size={14} className="ml-1" />
                    </button>
                 </div>
               ))}
               {subscription.portalsIncluded.length === 0 && (
                   <p className="text-gray-500 text-sm">No portals active via this subscription.</p>
               )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
