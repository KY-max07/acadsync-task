import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { PricingProvider } from './context/PricingContext';
import { SubscriptionProvider } from './context/SubscriptionContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import Landing from './pages/Landing';
import StudentPortal from './pages/StudentPortal';
import TeacherPortal from './pages/TeacherPortal';
import SchoolPortal from './pages/SchoolPortal';

import MyPurchases from './pages/MyPurchases';
import Upgrade from './pages/Upgrade';

// Placeholder/Not Found
const NotFound = () => <div className="p-8 text-center"><h2 className="text-2xl font-bold">404 - Page Not Found</h2></div>;

function App() {
  return (
    <Router>
      <Toaster position="top-right" />
      <ThemeProvider>
        <AuthProvider>
          <SubscriptionProvider>
            <PricingProvider>
              <Layout>
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<Landing />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  
                  {/* Protected Routes */}
                  <Route element={<ProtectedRoute />}>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route  path="/admin" element={<AdminDashboard />} />
                    <Route path="/student" element={<StudentPortal />} />
                    <Route path="/teacher" element={<TeacherPortal />} />
                    <Route path="/school" element={<SchoolPortal />} />
                    <Route path="/my-purchases" element={<MyPurchases />} />
                    <Route path="/upgrade" element={<Upgrade />} />
                  </Route>

                  {/* Submit to dashboard if logging in, otherwise landing */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Layout>
            </PricingProvider>
          </SubscriptionProvider>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
