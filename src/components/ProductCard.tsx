import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Product } from '@/hooks/useProducts';
import { getProductCardImage } from '@/lib/imageUtils';
import { formatPKR } from '@/lib/currency';
import ProductMenu from './ProductMenu';

interface ProductCardProps {
  product: Product;
  index: number;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, index }) => {
  const navigate = useNavigate();
  const imageUrl = product.images[0] ? getProductCardImage(product.images[0]) : '';
  const isOutOfStock = product.stock <= 0;

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
        {/* Three-dots menu */}
        <ProductMenu 
          productId={product.id} 
          className="absolute top-3 right-3 z-10" 
        />
        
        {imageUrl && imageUrl.length > 0 ? (
          <img
            src={imageUrl}
            alt={product.name}
            className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 ${isOutOfStock ? 'opacity-50' : ''}`}
            loading="lazy"
            decoding="async"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground bg-secondary">
            No Image
          </div>
        )}
        
        {/* Stock Badge */}
        {isOutOfStock && (
          <Badge variant="destructive" className="absolute top-3 left-3">
            Out of Stock
          </Badge>
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
          <div>
            <span className="text-xl font-bold text-accent">
              {formatPKR(product.price)}
            </span>
            {!isOutOfStock && (
              <p className="text-xs text-muted-foreground mt-0.5">
                {product.stock} available
              </p>
            )}
          </div>
          
          <Button
            onClick={() => navigate(`/product/${product.id}`)}
            size="sm"
            className="btn-accent text-sm px-4 py-2"
            disabled={isOutOfStock}
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            {isOutOfStock ? 'Sold Out' : 'Buy Now'}
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
