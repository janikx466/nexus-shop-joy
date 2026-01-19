import React, { useState } from 'react';
import { Loader2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';

const FirebaseSettings: React.FC = () => {
  const { isDemoAdmin } = useAuth();
  
  const existingConfig = localStorage.getItem('firebaseConfig');
  const parsedConfig = existingConfig ? JSON.parse(existingConfig) : null;
  
  const [formData, setFormData] = useState({
    apiKey: parsedConfig?.apiKey || '',
    authDomain: parsedConfig?.authDomain || '',
    projectId: parsedConfig?.projectId || '',
    storageBucket: parsedConfig?.storageBucket || '',
    messagingSenderId: parsedConfig?.messagingSenderId || '',
    appId: parsedConfig?.appId || '',
  });
  
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    if (isDemoAdmin) return;
    
    setSaving(true);
    localStorage.setItem('firebaseConfig', JSON.stringify(formData));
    
    setTimeout(() => {
      setSaving(false);
      setSaved(true);
      setTimeout(() => {
        setSaved(false);
        // Reload to reinitialize Firebase with new config
        window.location.reload();
      }, 1500);
    }, 500);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-display font-bold text-foreground">
        Firebase Configuration
      </h2>

      {isDemoAdmin && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-yellow-800 text-sm">
          ⚠️ Demo Admin mode - View only
        </div>
      )}

      <div className="bg-card rounded-xl border p-6 space-y-6">
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-medium text-amber-900 mb-1">Important</h3>
            <p className="text-sm text-amber-700">
              Changing Firebase configuration will reload the page and may affect your data.
              Only change this if your current Firebase project has reached its limits.
            </p>
          </div>
        </div>

        <div className="grid gap-4">
          <div className="space-y-2">
            <Label htmlFor="apiKey">API Key</Label>
            <Input
              id="apiKey"
              value={formData.apiKey}
              onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
              placeholder="AIzaSy..."
              disabled={isDemoAdmin}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="authDomain">Auth Domain</Label>
            <Input
              id="authDomain"
              value={formData.authDomain}
              onChange={(e) => setFormData({ ...formData, authDomain: e.target.value })}
              placeholder="your-project.firebaseapp.com"
              disabled={isDemoAdmin}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="projectId">Project ID</Label>
            <Input
              id="projectId"
              value={formData.projectId}
              onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
              placeholder="your-project-id"
              disabled={isDemoAdmin}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="storageBucket">Storage Bucket</Label>
            <Input
              id="storageBucket"
              value={formData.storageBucket}
              onChange={(e) => setFormData({ ...formData, storageBucket: e.target.value })}
              placeholder="your-project.appspot.com"
              disabled={isDemoAdmin}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="messagingSenderId">Messaging Sender ID</Label>
            <Input
              id="messagingSenderId"
              value={formData.messagingSenderId}
              onChange={(e) => setFormData({ ...formData, messagingSenderId: e.target.value })}
              placeholder="123456789"
              disabled={isDemoAdmin}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="appId">App ID</Label>
            <Input
              id="appId"
              value={formData.appId}
              onChange={(e) => setFormData({ ...formData, appId: e.target.value })}
              placeholder="1:123456789:web:abc123"
              disabled={isDemoAdmin}
            />
          </div>
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
            '✓ Saved! Reloading...'
          ) : (
            'Save & Apply Configuration'
          )}
        </Button>
      </div>
    </div>
  );
};

export default FirebaseSettings;
