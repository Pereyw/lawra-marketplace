'use client';

import { ProductCard } from './ProductCard';

interface Product {
  id: string;
  title: string;
  price: number;
  image: string;
  rating: number;
  reviewCount: number;
  seller: string;
  isVerified: boolean;
}

interface ProductGridProps {
  products: Product[];
  onViewDetails: (productId: string) => void;
}

export function ProductGrid({ products, onViewDetails }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">No products found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onViewDetails={onViewDetails}
        />
      ))}
    </div>
  );
}