import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit, Trash2, Loader2, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useSite } from '@/contexts/SiteContext';
import { useAuth } from '@/contexts/AuthContext';

interface PaymentMethod {
  id: string;
  name: string;
  receiverName: string;
  receiverNumber: string;
}

const PaymentSettings: React.FC = () => {
  const { settings, updateSettings } = useSite();
  const { isDemoAdmin } = useAuth();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMethod, setEditingMethod] = useState<PaymentMethod | null>(null);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    receiverName: '',
    receiverNumber: '',
  });

  const resetForm = () => {
    setFormData({
      name: '',
      receiverName: '',
      receiverNumber: '',
    });
    setEditingMethod(null);
  };

  const handleEdit = (method: PaymentMethod) => {
    setEditingMethod(method);
    setFormData({
      name: method.name,
      receiverName: method.receiverName,
      receiverNumber: method.receiverNumber,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isDemoAdmin) return;
    
    setSaving(true);
    try {
      const newMethod: PaymentMethod = {
        id: editingMethod?.id || Date.now().toString(),
        ...formData,
      };

      let updatedMethods: PaymentMethod[];
      
      if (editingMethod) {
        updatedMethods = settings.paymentMethods.map((m) =>
          m.id === editingMethod.id ? newMethod : m
        );
      } else {
        updatedMethods = [...settings.paymentMethods, newMethod];
      }

      await updateSettings({ paymentMethods: updatedMethods });
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error saving payment method:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (isDemoAdmin) return;
    if (confirm('Are you sure you want to delete this payment method?')) {
      const updatedMethods = settings.paymentMethods.filter((m) => m.id !== id);
      await updateSettings({ paymentMethods: updatedMethods });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-display font-bold text-foreground">
          Payment Methods
        </h2>
        
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button 
              className="btn-accent"
              disabled={isDemoAdmin}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Method
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-display">
                {editingMethod ? 'Edit Payment Method' : 'Add Payment Method'}
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="name">Payment Method Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., M-Pesa, Bank Transfer"
                  required
                  disabled={isDemoAdmin}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="receiverName">Receiver Name</Label>
                <Input
                  id="receiverName"
                  value={formData.receiverName}
                  onChange={(e) => setFormData({ ...formData, receiverName: e.target.value })}
                  placeholder="Name on the account"
                  required
                  disabled={isDemoAdmin}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="receiverNumber">Receiver Number / Account</Label>
                <Input
                  id="receiverNumber"
                  value={formData.receiverNumber}
                  onChange={(e) => setFormData({ ...formData, receiverNumber: e.target.value })}
                  placeholder="Phone or account number"
                  required
                  disabled={isDemoAdmin}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 btn-accent"
                  disabled={saving || isDemoAdmin}
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : editingMethod ? (
                    'Update'
                  ) : (
                    'Add Method'
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isDemoAdmin && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-yellow-800 text-sm">
          ⚠️ Demo Admin mode - View only
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-700">
        At least one payment method is required for customers to place orders.
      </div>

      {/* Payment Methods List */}
      {settings.paymentMethods.length === 0 ? (
        <div className="text-center py-12 bg-secondary/30 rounded-2xl">
          <CreditCard className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No payment methods configured.</p>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {settings.paymentMethods.map((method, index) => (
              <motion.div
                key={method.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ delay: index * 0.05 }}
                className="bg-card rounded-xl border p-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                    <CreditCard className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{method.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {method.receiverName} • {method.receiverNumber}
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(method)}
                    disabled={isDemoAdmin}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(method.id)}
                    className="text-destructive hover:text-destructive"
                    disabled={isDemoAdmin}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default PaymentSettings;
