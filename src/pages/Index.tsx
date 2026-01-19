import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import DiscountBanner from '@/components/DiscountBanner';
import ProductCard from '@/components/ProductCard';
import LoadingScreen from '@/components/LoadingScreen';
import { useProducts } from '@/hooks/useProducts';
import { Sparkles } from 'lucide-react';

const Index: React.FC = () => {
  const [showLoading, setShowLoading] = useState(true);
  const { products, loading } = useProducts();

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <AnimatePresence>
        {showLoading && <LoadingScreen />}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: showLoading ? 0 : 1 }}
        transition={{ duration: 0.5 }}
        className="min-h-screen flex flex-col bg-background"
      >
        <DiscountBanner />
        <Header />

        <main className="flex-1">
          {/* Hero Section */}
          <section className="relative py-16 lg:py-24 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-secondary/50 to-transparent" />
            
            <div className="container mx-auto px-4 relative z-10">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="text-center max-w-3xl mx-auto"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, type: "spring" }}
                  className="inline-flex items-center gap-2 bg-accent/10 text-accent px-4 py-2 rounded-full mb-6"
                >
                  <Sparkles className="h-4 w-4" />
                  <span className="text-sm font-medium">Premium Quality Products</span>
                </motion.div>
                
                <h1 className="text-4xl lg:text-6xl font-display font-bold text-foreground mb-6">
                  Discover Our
                  <span className="text-gradient"> Exclusive </span>
                  Collection
                </h1>
                
                <p className="text-lg text-muted-foreground max-w-xl mx-auto">
                  Shop the finest selection of products with seamless ordering via WhatsApp.
                  Quality you can trust, delivered to your doorstep.
                </p>
              </motion.div>
            </div>
          </section>

          {/* Products Section */}
          <section className="py-12 lg:py-16">
            <div className="container mx-auto px-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="flex items-center justify-between mb-8"
              >
                <h2 className="text-2xl lg:text-3xl font-display font-bold text-foreground">
                  Our Products
                </h2>
                <span className="text-sm text-muted-foreground">
                  {products.length} {products.length === 1 ? 'item' : 'items'}
                </span>
              </motion.div>

              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <div className="loading-spinner w-12 h-12" />
                </div>
              ) : products.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-20"
                >
                  <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-secondary flex items-center justify-center">
                    <Sparkles className="h-10 w-10 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-display font-semibold text-foreground mb-2">
                    Coming Soon
                  </h3>
                  <p className="text-muted-foreground">
                    Our products are being prepared. Check back soon!
                  </p>
                </motion.div>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {products.map((product, index) => (
                    <ProductCard key={product.id} product={product} index={index} />
                  ))}
                </div>
              )}
            </div>
          </section>
        </main>

        <Footer />
      </motion.div>
    </>
  );
};

export default Index;
