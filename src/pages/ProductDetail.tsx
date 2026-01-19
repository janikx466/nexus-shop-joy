import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ShoppingCart, Check } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import DiscountBanner from '@/components/DiscountBanner';
import ImageCarousel from '@/components/ImageCarousel';
import { useAuth } from '@/contexts/AuthContext';
import { Product } from '@/hooks/useProducts';

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      
      try {
        const docRef = doc(db, 'products', id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setProduct({
            id: docSnap.id,
            ...docSnap.data(),
          } as Product);
        }
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleBuy = () => {
    if (!user) {
      navigate(`/auth?mode=login&redirect=/order/${id}`);
    } else {
      navigate(`/order/${id}`);
    }
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
      <DiscountBanner />
      <Header />

      <main className="flex-1 py-8">
        <div className="container mx-auto px-4">
          {/* Back Button */}
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Products</span>
          </motion.button>

          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Image Carousel */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <ImageCarousel images={product.images} />
            </motion.div>

            {/* Product Info */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="space-y-6"
            >
              <div>
                <h1 className="text-3xl lg:text-4xl font-display font-bold text-foreground mb-4">
                  {product.name}
                </h1>
                
                <div className="flex items-baseline gap-3">
                  <span className="text-4xl font-bold text-accent">
                    ${product.price.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Buy Button */}
              <Button
                onClick={handleBuy}
                className="btn-accent w-full text-lg py-6"
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                Buy Now
              </Button>

              {/* Description */}
              <div className="bg-secondary/50 rounded-2xl p-6 border">
                <h2 className="font-display font-semibold text-lg mb-3 text-foreground">
                  Description
                </h2>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {product.description || 'No description available.'}
                </p>
              </div>

              {/* Features */}
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <Check className="h-5 w-5 text-green-500" />
                  <span>Fast & Secure Delivery</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <Check className="h-5 w-5 text-green-500" />
                  <span>Easy WhatsApp Order Confirmation</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <Check className="h-5 w-5 text-green-500" />
                  <span>Multiple Payment Options</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ProductDetail;
