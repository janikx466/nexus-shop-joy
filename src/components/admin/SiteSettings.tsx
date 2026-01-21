import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useSite } from '@/contexts/SiteContext';
import { useAuth } from '@/contexts/AuthContext';
import ImageUploader from './ImageUploader';

const SiteSettings: React.FC = () => {
  const { settings, updateSettings } = useSite();
  const { isDemoAdmin } = useAuth();
  
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    siteName: settings.siteName,
    logoUrl: settings.logoUrl,
    faviconUrl: settings.faviconUrl,
    footerContent: settings.footerContent,
    whatsappNumber: settings.whatsappNumber,
  });

  const handleSave = async () => {
    if (isDemoAdmin) return;
    
    setSaving(true);
    try {
      await updateSettings(formData);
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-display font-bold text-foreground">
        Site Settings
      </h2>

      {isDemoAdmin && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-yellow-800 text-sm">
          ⚠️ Demo Admin mode - View only
        </div>
      )}

      <div className="bg-card rounded-xl border p-6 space-y-6">
        <div className="space-y-2">
          <Label htmlFor="siteName">Website Name</Label>
          <Input
            id="siteName"
            value={formData.siteName}
            onChange={(e) => setFormData({ ...formData, siteName: e.target.value })}
            placeholder="Your Store Name"
            disabled={isDemoAdmin}
          />
        </div>

        <div className="space-y-2">
          <Label>Website Logo</Label>
          <ImageUploader
            images={formData.logoUrl ? [formData.logoUrl] : []}
            onImagesChange={(images) => setFormData({ ...formData, logoUrl: images[0] || '' })}
            disabled={isDemoAdmin}
          />
        </div>

        <div className="space-y-2">
          <Label>Website Favicon</Label>
          <p className="text-sm text-muted-foreground mb-2">
            Upload a square image (32x32 or 64x64 recommended) to use as your site's favicon.
          </p>
          <ImageUploader
            images={formData.faviconUrl ? [formData.faviconUrl] : []}
            onImagesChange={(images) => setFormData({ ...formData, faviconUrl: images[0] || '' })}
            disabled={isDemoAdmin}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="whatsappNumber">WhatsApp Number</Label>
          <Input
            id="whatsappNumber"
            value={formData.whatsappNumber}
            onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
            placeholder="+1234567890 (with country code)"
            disabled={isDemoAdmin}
          />
          <p className="text-sm text-muted-foreground">
            All order confirmations will be sent to this number
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="footerContent">Footer Content</Label>
          <Textarea
            id="footerContent"
            value={formData.footerContent}
            onChange={(e) => setFormData({ ...formData, footerContent: e.target.value })}
            placeholder="© 2024 Your Store. All rights reserved."
            rows={3}
            disabled={isDemoAdmin}
          />
        </div>

        <Button
          onClick={handleSave}
          className="w-full btn-accent"
          disabled={saving || isDemoAdmin}
        >
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            'Save Changes'
          )}
        </Button>
      </div>
    </div>
  );
};

export default SiteSettings;
