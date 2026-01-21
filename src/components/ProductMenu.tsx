import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MoreVertical, Copy, ExternalLink } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { getProductUrl } from '@/lib/imageUtils';

interface ProductMenuProps {
  productId: string;
  className?: string;
}

const ProductMenu: React.FC<ProductMenuProps> = ({ productId, className = '' }) => {
  const navigate = useNavigate();

  const handleCopyLink = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const productUrl = getProductUrl(productId);
    
    try {
      await navigator.clipboard.writeText(productUrl);
      toast({
        title: "Product link copied",
        description: productUrl,
      });
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Could not copy the link to clipboard",
        variant: "destructive",
      });
    }
  };

  const handleOpenPage = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/product/${productId}`);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
        <Button
          variant="ghost"
          size="icon"
          className={`h-8 w-8 rounded-full bg-background/80 hover:bg-background shadow-sm ${className}`}
        >
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={handleCopyLink}>
          <Copy className="h-4 w-4 mr-2" />
          Copy Product Link
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleOpenPage}>
          <ExternalLink className="h-4 w-4 mr-2" />
          Open Product Page
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ProductMenu;
