import { useEffect } from 'react';
import { useSite } from '@/contexts/SiteContext';

const FaviconUpdater: React.FC = () => {
  const { settings } = useSite();

  useEffect(() => {
    if (settings.faviconUrl) {
      // Update the favicon dynamically
      let link = document.querySelector<HTMLLinkElement>("link[rel*='icon']");
      
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.head.appendChild(link);
      }
      
      link.type = 'image/x-icon';
      link.href = settings.faviconUrl;
    }
  }, [settings.faviconUrl]);

  // Also update the document title
  useEffect(() => {
    if (settings.siteName) {
      document.title = settings.siteName;
    }
  }, [settings.siteName]);

  return null;
};

export default FaviconUpdater;
