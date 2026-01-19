import React from 'react';
import { useSite } from '@/contexts/SiteContext';
import { ShoppingBag } from 'lucide-react';

const Footer: React.FC = () => {
  const { settings } = useSite();

  return (
    <footer className="border-t bg-secondary/50 py-8 mt-auto">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center justify-center gap-4">
          <div className="flex items-center gap-2">
            {settings.logoUrl ? (
              <img 
                src={settings.logoUrl} 
                alt={settings.siteName} 
                className="h-6 w-6 object-contain"
              />
            ) : (
              <ShoppingBag className="h-6 w-6 text-accent" />
            )}
            <span className="font-display font-semibold text-foreground">
              {settings.siteName}
            </span>
          </div>
          <p className="text-sm text-muted-foreground text-center">
            {settings.footerContent}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
