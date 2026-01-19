import React from 'react';
import { motion } from 'framer-motion';
import { Tag, X } from 'lucide-react';
import { useSite } from '@/contexts/SiteContext';

const DiscountBanner: React.FC = () => {
  const { settings } = useSite();
  const [isVisible, setIsVisible] = React.useState(true);

  if (!settings.discountPoster.enabled || !isVisible) return null;

  return (
    <motion.div
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -50, opacity: 0 }}
      className="relative bg-accent text-accent-foreground"
    >
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-center gap-3 text-sm font-medium">
          <Tag className="h-4 w-4 animate-pulse" />
          <span>
            {settings.discountPoster.description} — 
            <span className="font-bold ml-1">
              {settings.discountPoster.discountValue} OFF!
            </span>
          </span>
        </div>
      </div>
      <button
        onClick={() => setIsVisible(false)}
        className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-white/20 rounded-full transition-colors"
      >
        <X className="h-4 w-4" />
      </button>
    </motion.div>
  );
};

export default DiscountBanner;
