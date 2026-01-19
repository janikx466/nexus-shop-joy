import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { getCloudinaryConfig, setCloudinaryCloudName } from '@/lib/cloudinary';

const CloudinarySettings: React.FC = () => {
  const { isDemoAdmin } = useAuth();
  const config = getCloudinaryConfig();
  
  const [cloudName, setCloudName] = useState(config.cloudName);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    if (isDemoAdmin) return;
    
    setSaving(true);
    setCloudinaryCloudName(cloudName);
    
    setTimeout(() => {
      setSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }, 500);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-display font-bold text-foreground">
        Cloudinary Configuration
      </h2>

      {isDemoAdmin && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-yellow-800 text-sm">
          ⚠️ Demo Admin mode - View only
        </div>
      )}

      <div className="bg-card rounded-xl border p-6 space-y-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-medium text-blue-900 mb-2">Why configure Cloudinary?</h3>
          <p className="text-sm text-blue-700">
            Cloudinary stores your product images. If your current account reaches its storage limit,
            you can switch to a new Cloudinary account and continue uploading images without disruption.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="cloudName">Cloud Name</Label>
          <Input
            id="cloudName"
            value={cloudName}
            onChange={(e) => setCloudName(e.target.value)}
            placeholder="Your Cloudinary cloud name"
            disabled={isDemoAdmin}
          />
          <p className="text-sm text-muted-foreground">
            Find this in your Cloudinary Dashboard → Settings
          </p>
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
          ) : saved ? (
            '✓ Saved!'
          ) : (
            'Save Configuration'
          )}
        </Button>
      </div>
    </div>
  );
};

export default CloudinarySettings;
