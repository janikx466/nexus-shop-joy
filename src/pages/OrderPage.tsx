import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, ArrowLeft, Check, Loader2, Minus, Plus } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { useSite } from '@/contexts/SiteContext';
import { Product } from '@/hooks/useProducts';
import { formatPKR, generateOrderId } from '@/lib/currency';
import { getOrderPageImage } from '@/lib/imageUtils';

const OrderPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { settings } = useSite();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [orderConfirmed, setOrderConfirmed] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [quantity, setQuantity] = useState(1);

  const [formData, setFormData] = useState({
    userName: '',
    whatsappNumber: '',
    city: '',
    fullAddress: '',
    paymentMethod: '',
    receiverName: '',
    receiverNumber: '',
    senderName: '',
    senderNumber: '',
    tillId: '',
  });

  useEffect(() => {
    if (!user) {
      navigate(`/auth?mode=login&redirect=/order/${id}${searchParams.get('qty') ? `?qty=${searchParams.get('qty')}` : ''}`);
      return;
    }

    const fetchProduct = async () => {
      if (!id) return;
      
      try {
        const docRef = doc(db, 'products', id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const productData = {
            id: docSnap.id,
            ...docSnap.data(),
            stock: docSnap.data().stock ?? 0,
          } as Product;
          setProduct(productData);
          
          // Set initial quantity from URL params
          const qtyParam = parseInt(searchParams.get('qty') || '1');
          setQuantity(Math.max(1, Math.min(qtyParam, productData.stock)));
        }
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, user, navigate, searchParams]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };
  const maxQuantity = product ? product.stock : 1;
  const totalAmount = product ? product.price * quantity : 0;

  const handleQuantityChange = (delta: number) => {
    setQuantity(prev => Math.max(1, Math.min(prev + delta, maxQuantity)));
  };

  const handlePaymentMethodChange = (value: string) => {
    const selectedMethod = settings.paymentMethods.find(m => m.id === value);
    setFormData(prev => ({
      ...prev,
      paymentMethod: value,
      receiverName: selectedMethod?.receiverName || '',
      receiverNumber: selectedMethod?.receiverNumber || '',
    }));
  };

  const handleSendWhatsApp = () => {
    if (!product || !settings.whatsappNumber) return;

    setSending(true);
    
    // Generate unique Order ID
    const newOrderId = generateOrderId();
    setOrderId(newOrderId);
    
    // Get product URL - always use the production URL
    const productUrl = `https://luxre.vercel.app/product/${product.id}`;
    
    const paymentMethodName = settings.paymentMethods.find(m => m.id === formData.paymentMethod)?.name || 'N/A';
    
    const message = `🛒 NEW ORDER RECEIVED

🆔 Order ID: ${newOrderId}

📦 Product: ${product.name}
🔗 Product Link:
${productUrl}

💰 Price: ${formatPKR(product.price)}
📦 Quantity: ${quantity}
📥 Total Amount: ${formatPKR(totalAmount)}

👤 Customer: ${formData.userName}
📞 WhatsApp: ${formData.whatsappNumber}
📍 Address: ${formData.city}, ${formData.fullAddress}

💳 Payment Method: ${paymentMethodName}
📥 Receiver: ${formData.receiverName} (${formData.receiverNumber})
${formData.senderName ? `📤 Sender: ${formData.senderName} (${formData.senderNumber || 'N/A'})` : ''}
${formData.tillId ? `🏧 Till ID: ${formData.tillId}` : ''}

Thank you for your order! 🙏`;

    const whatsappUrl = `https://wa.me/${settings.whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');

    setTimeout(() => {
      setSending(false);
      setOrderConfirmed(true);
    }, 4000);
  };

  const isFormValid = () => {
    return (
      formData.userName &&
      formData.whatsappNumber &&
      formData.city &&
      formData.fullAddress &&
      formData.paymentMethod &&
      settings.whatsappNumber
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading-spinner w-12 h-12" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-display font-bold mb-4">Product Not Found</h1>
            <Button onClick={() => navigate('/')}>Go Back Home</Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 py-8">
        <div className="container mx-auto px-4 max-w-2xl">
          <AnimatePresence mode="wait">
            {orderConfirmed ? (
              <motion.div
                key="confirmed"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="text-center py-16"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring" }}
                  className="w-24 h-24 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center"
                >
                  <Check className="h-12 w-12 text-green-600" />
                </motion.div>
                
                <h1 className="text-3xl font-display font-bold text-foreground mb-4">
                  Thank You!
                </h1>
                {orderId && (
                  <p className="text-lg text-muted-foreground mb-2">
                    Order ID: <span className="font-mono font-semibold text-foreground">{orderId}</span>
                  </p>
                )}
                <p className="text-xl text-muted-foreground mb-8">
                  Your order has been confirmed.
                </p>
                
                <Button
                  onClick={() => navigate('/')}
                  className="btn-accent"
                >
                  <ArrowLeft className="h-5 w-5 mr-2" />
                  Back to Store
                </Button>
              </motion.div>
            ) : (
              <motion.div
                key="form"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                {/* Back Button */}
                <button
                  onClick={() => navigate(`/product/${id}`)}
                  className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
                >
                  <ArrowLeft className="h-5 w-5" />
                  <span>Back to Product</span>
                </button>

                <h1 className="text-3xl font-display font-bold text-foreground mb-2">
                  Complete Your Order
                </h1>
                <p className="text-muted-foreground mb-8">
                  Fill in your details to proceed with the order.
                </p>

                {/* Product Summary */}
                <div className="bg-secondary/50 rounded-2xl p-6 border mb-8">
                  <div className="flex items-center gap-4">
                    {product.images[0] ? (
                      <img
                        src={getOrderPageImage(product.images[0])}
                        alt={product.name}
                        className="w-20 h-20 rounded-lg object-cover bg-secondary"
                        loading="eager"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground text-xs">
                        No Image
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground">{product.name}</h3>
                      <p className="text-lg font-bold text-accent mt-1">
                        {formatPKR(product.price)} × {quantity}
                      </p>
                    </div>
                  </div>
                  
                  {/* Quantity Selector */}
                  <div className="mt-4 pt-4 border-t flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-muted-foreground">Quantity:</span>
                      <div className="flex items-center gap-2 bg-background rounded-lg p-1 border">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleQuantityChange(-1)}
                          disabled={quantity <= 1}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-8 text-center font-semibold">{quantity}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleQuantityChange(1)}
                          disabled={quantity >= maxQuantity}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        ({product.stock} available)
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Total</p>
                      <p className="text-2xl font-bold text-accent">{formatPKR(totalAmount)}</p>
                    </div>
                  </div>
                </div>

                {/* Order Form */}
                <div className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="userName">Your Name *</Label>
                      <Input
                        id="userName"
                        name="userName"
                        value={formData.userName}
                        onChange={handleInputChange}
                        placeholder="Enter your name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="whatsappNumber">WhatsApp Number *</Label>
                      <Input
                        id="whatsappNumber"
                        name="whatsappNumber"
                        value={formData.whatsappNumber}
                        onChange={handleInputChange}
                        placeholder="+1234567890"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      placeholder="Enter your city"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fullAddress">Full Address *</Label>
                    <Input
                      id="fullAddress"
                      name="fullAddress"
                      value={formData.fullAddress}
                      onChange={handleInputChange}
                      placeholder="Enter your complete address"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Payment Method *</Label>
                    <Select onValueChange={handlePaymentMethodChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select payment method" />
                      </SelectTrigger>
                      <SelectContent>
                        {settings.paymentMethods.length > 0 ? (
                          settings.paymentMethods.map((method) => (
                            <SelectItem key={method.id} value={method.id}>
                              {method.name}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="none" disabled>
                            No payment methods available
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  {formData.paymentMethod && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="grid sm:grid-cols-2 gap-4"
                    >
                      <div className="space-y-2">
                        <Label htmlFor="receiverName">Receiver Name</Label>
                        <Input
                          id="receiverName"
                          name="receiverName"
                          value={formData.receiverName}
                          onChange={handleInputChange}
                          disabled
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="receiverNumber">Receiver Number</Label>
                        <Input
                          id="receiverNumber"
                          name="receiverNumber"
                          value={formData.receiverNumber}
                          onChange={handleInputChange}
                          disabled
                        />
                      </div>
                    </motion.div>
                  )}

                  <div className="border-t pt-6">
                    <h3 className="font-semibold text-foreground mb-4">
                      Optional Details
                    </h3>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="senderName">Sender Name</Label>
                        <Input
                          id="senderName"
                          name="senderName"
                          value={formData.senderName}
                          onChange={handleInputChange}
                          placeholder="Optional"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="senderNumber">Sender Number</Label>
                        <Input
                          id="senderNumber"
                          name="senderNumber"
                          value={formData.senderNumber}
                          onChange={handleInputChange}
                          placeholder="Optional"
                        />
                      </div>
                    </div>
                    <div className="mt-4 space-y-2">
                      <Label htmlFor="tillId">Till ID</Label>
                      <Input
                        id="tillId"
                        name="tillId"
                        value={formData.tillId}
                        onChange={handleInputChange}
                        placeholder="Optional"
                      />
                    </div>
                  </div>

                  {/* WhatsApp Button */}
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      onClick={handleSendWhatsApp}
                      disabled={!isFormValid() || sending}
                      className="w-full btn-accent text-lg py-6 animate-pulse-glow"
                    >
                      {sending ? (
                        <>
                          <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <MessageCircle className="h-5 w-5 mr-2" />
                          Send Details via WhatsApp
                        </>
                      )}
                    </Button>
                  </motion.div>

                  {!settings.whatsappNumber && (
                    <p className="text-sm text-destructive text-center">
                      WhatsApp number not configured. Please contact admin.
                    </p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default OrderPage;
