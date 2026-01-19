import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useSite } from '@/contexts/SiteContext';
import { useAuth } from '@/contexts/AuthContext';

const DiscountPosterSettings: React.FC = () => {
  const { settings, updateSettings } = useSite();
  const { isDemoAdmin } = useAuth();
  
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    enabled: settings.discountPoster.enabled,
    description: settings.discountPoster.description,
    discountValue: settings.discountPoster.discountValue,
  });

  const handleSave = async () => {
    if (isDemoAdmin) return;
    
    setSaving(true);
    try {
      await updateSettings({
        discountPoster: formData,
      });
    } catch (error) {
      console.error('Error saving discount settings:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-display font-bold text-foreground">
        Discount Poster
      </h2>

      {isDemoAdmin && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-yellow-800 text-sm">
          ⚠️ Demo Admin mode - View only
        </div>
      )}

      <div className="bg-card rounded-xl border p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="enabled" className="text-base font-medium">
              Enable Discount Banner
            </Label>
            <p className="text-sm text-muted-foreground mt-1">
              Show a promotional banner at the top of your store
            </p>
          </div>
          <Switch
            id="enabled"
            checked={formData.enabled}
            onCheckedChange={(checked) => setFormData({ ...formData, enabled: checked })}
            disabled={isDemoAdmin}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Banner Message</Label>
          <Input
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="e.g., Summer Sale! Get amazing discounts"
            disabled={isDemoAdmin}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="discountValue">Discount Value</Label>
          <Input
            id="discountValue"
            value={formData.discountValue}
            onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
            placeholder="e.g., 20%, $50, or any custom text"
            disabled={isDemoAdmin}
          />
        </div>

        {formData.enabled && formData.description && (
          <div className="bg-accent text-accent-foreground rounded-lg p-4 text-center">
            <p className="font-medium">
              {formData.description} — <span className="font-bold">{formData.discountValue} OFF!</span>
            </p>
          </div>
        )}

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

export default DiscountPosterSettings;
