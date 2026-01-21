import React, { createContext, useContext, useEffect, useState } from 'react';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface PaymentMethod {
  id: string;
  name: string;
  receiverName: string;
  receiverNumber: string;
}

interface DiscountPoster {
  enabled: boolean;
  description: string;
  discountValue: string;
}

interface SiteSettings {
  siteName: string;
  logoUrl: string;
  faviconUrl: string;
  footerContent: string;
  whatsappNumber: string;
  paymentMethods: PaymentMethod[];
  discountPoster: DiscountPoster;
}

interface SiteContextType {
  settings: SiteSettings;
  loading: boolean;
  updateSettings: (settings: Partial<SiteSettings>) => Promise<void>;
}

const defaultSettings: SiteSettings = {
  siteName: 'Luxe Store',
  logoUrl: '',
  faviconUrl: '',
  footerContent: '© 2024 Luxe Store. All rights reserved.',
  whatsappNumber: '',
  paymentMethods: [],
  discountPoster: {
    enabled: false,
    description: '',
    discountValue: '',
  },
};

const SiteContext = createContext<SiteContextType | undefined>(undefined);

export const SiteProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      doc(db, 'settings', 'site'),
      (doc) => {
        if (doc.exists()) {
          setSettings({ ...defaultSettings, ...doc.data() } as SiteSettings);
        }
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching site settings:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const updateSettings = async (newSettings: Partial<SiteSettings>) => {
    await setDoc(doc(db, 'settings', 'site'), { ...settings, ...newSettings }, { merge: true });
  };

  return (
    <SiteContext.Provider value={{ settings, loading, updateSettings }}>
      {children}
    </SiteContext.Provider>
  );
};

export const useSite = () => {
  const context = useContext(SiteContext);
  if (context === undefined) {
    throw new Error('useSite must be used within a SiteProvider');
  }
  return context;
};
