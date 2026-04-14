'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tooltip } from '@/components/ui/tooltip';
import { Star, ShoppingCart, Eye, Heart } from 'lucide-react';
import { useCart } from '@/lib/cart-context';

interface ProductCardProps {
  product: {
    id: string;
    title: string;
    price: number;
    image: string;
    rating: number;
    reviewCount: number;
    seller: string;
    isVerified: boolean;
  };
  onViewDetails: (productId: string) => void;
}

export function ProductCard({ product, onViewDetails }: ProductCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const { dispatch } = useCart();

  const handleAddToCart = async () => {
    setIsAddingToCart(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 300));
    
    dispatch({
      type: 'ADD_ITEM',
      payload: {
        id: product.id,
        title: product.title,
        price: product.price,
        image: product.image,
        seller: product.seller,
      },
    });
    setIsAddingToCart(false);
  };

  return (
    <Card variant="modern" className="h-full flex flex-col group">
      {/* Image Section */}
      <div className="relative aspect-square overflow-hidden bg-gray-100 flex-shrink-0">
        <Image
          src={product.image}
          alt={product.title}
          fill
          className={`object-cover transition-transform duration-300 group-hover:scale-110 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={() => setImageLoaded(true)}
        />
        
        {!imageLoaded && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-gray-300 border-t-primary-600 rounded-full animate-spin" />
          </div>
        )}

        {/* Overlay Actions */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
          <Tooltip content="View Details">
            <Button
              onClick={() => onViewDetails(product.id)}
              size="sm"
              className="rounded-full p-2 w-10 h-10 flex items-center justify-center"
            >
              <Eye className="w-5 h-5" />
            </Button>
          </Tooltip>
          <Tooltip content={isFavorite ? 'Remove from Wishlist' : 'Add to Wishlist'}>
            <button
              onClick={() => setIsFavorite(!isFavorite)}
              className={`p-2 rounded-full transition-all duration-300 ${
                isFavorite
                  ? 'bg-red-500 text-white'
                  : 'bg-white/90 text-gray-600 hover:bg-white'
              }`}
            >
              <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
            </button>
          </Tooltip>
        </div>

        {/* Badges */}
        {product.isVerified && (
          <div className="absolute top-3 right-3">
            <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-green-500 text-white shadow-lg">
              Verified
            </span>
          </div>
        )}
      </div>

      {/* Content Section */}
      <CardContent className="flex-1 flex flex-col">
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">
          {product.title}
        </h3>

        {/* Rating */}
        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-4 h-4 ${
                  i < Math.floor(product.rating)
                    ? 'text-yellow-400 fill-current'
                    : 'text-gray-300'
                }`}
              />
            ))}
          </div>
          <span className="text-xs text-gray-600 font-medium">
            {product.rating.toFixed(1)} ({product.reviewCount})
          </span>
        </div>

        {/* Price */}
        <div className="mb-3">
          <p className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
            ₵{product.price.toLocaleString()}
          </p>
        </div>

        {/* Seller */}
        <p className="text-sm text-gray-600 mb-4">By {product.seller}</p>

        {/* Actions */}
        <div className="flex gap-2 mt-auto">
          <Button
            onClick={handleAddToCart}
            isLoading={isAddingToCart}
            className="flex-1"
            size="sm"
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            Add to Cart
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}