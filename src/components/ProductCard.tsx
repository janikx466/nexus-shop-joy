import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Product } from '@/hooks/useProducts';

interface ProductCardProps {
  product: Product;
  index: number;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, index }) => {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      whileHover={{ y: -8 }}
      className="group relative bg-card rounded-2xl overflow-hidden border shadow-md card-hover"
    >
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden bg-secondary">
        {product.images[0] ? (
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            No Image
          </div>
        )}
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-display font-semibold text-lg text-foreground mb-2 line-clamp-1">
          {product.name}
        </h3>
        
        <div className="flex items-center justify-between">
          <span className="text-xl font-bold text-accent">
            ${product.price.toFixed(2)}
          </span>
          
          <Button
            onClick={() => navigate(`/product/${product.id}`)}
            size="sm"
            className="btn-accent text-sm px-4 py-2"
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            Buy Now
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
