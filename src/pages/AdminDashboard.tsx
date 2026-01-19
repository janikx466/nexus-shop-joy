import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Package,
  Tag,
  Cloud,
  Database,
  Settings,
  CreditCard,
  ArrowLeft,
  Menu,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import ProductManagement from '@/components/admin/ProductManagement';
import DiscountPosterSettings from '@/components/admin/DiscountPosterSettings';
import CloudinarySettings from '@/components/admin/CloudinarySettings';
import FirebaseSettings from '@/components/admin/FirebaseSettings';
import SiteSettings from '@/components/admin/SiteSettings';
import PaymentSettings from '@/components/admin/PaymentSettings';

type AdminSection = 
  | 'products'
  | 'discount'
  | 'cloudinary'
  | 'firebase'
  | 'site'
  | 'payment';

const menuItems: { id: AdminSection; label: string; icon: React.ReactNode }[] = [
  { id: 'products', label: 'Products', icon: <Package className="h-5 w-5" /> },
  { id: 'discount', label: 'Discount Poster', icon: <Tag className="h-5 w-5" /> },
  { id: 'cloudinary', label: 'Cloudinary', icon: <Cloud className="h-5 w-5" /> },
  { id: 'firebase', label: 'Firebase', icon: <Database className="h-5 w-5" /> },
  { id: 'site', label: 'Site Settings', icon: <Settings className="h-5 w-5" /> },
  { id: 'payment', label: 'Payment', icon: <CreditCard className="h-5 w-5" /> },
];

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAdmin, isDemoAdmin, loading } = useAuth();
  const [activeSection, setActiveSection] = useState<AdminSection>('products');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth?mode=login');
    } else if (!loading && user && !isAdmin && !isDemoAdmin) {
      navigate('/');
    }
  }, [user, isAdmin, isDemoAdmin, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading-spinner w-12 h-12" />
      </div>
    );
  }

  if (!isAdmin && !isDemoAdmin) {
    return null;
  }

  const renderSection = () => {
    switch (activeSection) {
      case 'products':
        return <ProductManagement />;
      case 'discount':
        return <DiscountPosterSettings />;
      case 'cloudinary':
        return <CloudinarySettings />;
      case 'firebase':
        return <FirebaseSettings />;
      case 'site':
        return <SiteSettings />;
      case 'payment':
        return <PaymentSettings />;
      default:
        return <ProductManagement />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <div className="lg:hidden sticky top-0 z-50 bg-card border-b px-4 py-3 flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Store
        </Button>
        
        <h1 className="font-display font-bold">
          {isDemoAdmin ? 'Demo Admin' : 'Admin'}
        </h1>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="lg:hidden fixed inset-x-0 top-[53px] bg-card border-b z-40 p-4"
        >
          <nav className="space-y-2">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveSection(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  activeSection === item.id
                    ? 'bg-accent text-accent-foreground'
                    : 'hover:bg-secondary'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </motion.div>
      )}

      <div className="flex">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-64 min-h-screen border-r bg-card p-4">
          <div className="sticky top-0">
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
              className="w-full justify-start mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Store
            </Button>

            <div className="mb-6">
              <h1 className="text-xl font-display font-bold text-foreground">
                {isDemoAdmin ? 'Demo Dashboard' : 'Admin Dashboard'}
              </h1>
              {isDemoAdmin && (
                <span className="text-xs text-yellow-600 bg-yellow-100 px-2 py-0.5 rounded-full mt-2 inline-block">
                  View Only
                </span>
              )}
            </div>

            <nav className="space-y-1">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    activeSection === item.id
                      ? 'bg-accent text-accent-foreground'
                      : 'hover:bg-secondary text-foreground'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 lg:p-8">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            {renderSection()}
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
