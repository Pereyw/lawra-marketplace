'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/header';
import { ProductGrid } from '@/components/ProductGrid';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox'; // Assuming checkbox
import { ShoppingCart, Search, Filter } from 'lucide-react';
import { PageTransition, FadeIn } from '@/components/ui/page-transition';

interface Product {
  id: string;
  title: string;
  price: number;
  image: string;
  rating: number;
  reviewCount: number;
  seller: string;
  isVerified: boolean;
  category: string;
  location: string;
}

// Mock data
const mockProducts: Product[] = [
  {
    id: '1',
    title: 'Handwoven Basket',
    price: 45,
    image: '/api/placeholder/300/300',
    rating: 4.5,
    reviewCount: 23,
    seller: 'Artisan Mary',
    isVerified: true,
    category: 'Home & Garden',
    location: 'Lawra',
  },
  // Add more mock products...
];

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [priceRange, setPriceRange] = useState([0, 500]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedRatings, setSelectedRatings] = useState<number[]>([]);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Fetch products from API
    const fetchProducts = async () => {
      try {
        // const response = await fetch('/api/products');
        // const data = await response.json();
        // setProducts(data);
        setProducts(mockProducts);
      } catch (error) {
        console.error('Failed to fetch products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    let filtered = products.filter(product => {
      const matchesSearch = product.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1];
      const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(product.category);
      const matchesRating = selectedRatings.length === 0 || selectedRatings.some(rating => product.rating >= rating);
      const matchesLocation = selectedLocations.length === 0 || selectedLocations.includes(product.location);

      return matchesSearch && matchesPrice && matchesCategory && matchesRating && matchesLocation;
    });

    setFilteredProducts(filtered);
  }, [products, searchQuery, priceRange, selectedCategories, selectedRatings, selectedLocations]);

  const handleViewDetails = (productId: string) => {
    router.push(`/products/${productId}`);
  };

  const categories = ['Home & Garden', 'Fashion', 'Electronics', 'Food'];
  const locations = ['Lawra', 'Nearby'];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <PageTransition direction="up">
        {/* Custom Navbar for Products */}
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex-1 max-w-lg">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  className="lg:hidden"
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Filters
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex">
            {/* Sidebar Filters */}
            <FadeIn delay={100}>
              <div className={`w-64 pr-8 ${showFilters ? 'block' : 'hidden'} lg:block`}>
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <h3 className="font-semibold text-lg mb-4">Filters</h3>

                  {/* Price Range */}
                  <div className="mb-6">
                    <h4 className="font-medium mb-2">Price Range</h4>
                    <div className="flex space-x-2">
                      <Input
                        type="number"
                        placeholder="Min price"
                        value={priceRange[0]}
                        onChange={(e) => setPriceRange([parseInt(e.target.value) || 0, priceRange[1]])}
                        className="w-20"
                      />
                      <span className="self-center">-</span>
                      <Input
                        type="number"
                        placeholder="Max price"
                        value={priceRange[1]}
                        onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value) || 500])}
                        className="w-20"
                      />
                    </div>
                    <div className="flex justify-between text-sm text-gray-600 mt-2">
                      <span>₵{priceRange[0]}</span>
                      <span>₵{priceRange[1]}</span>
                    </div>
                  </div>

                  {/* Categories */}
                  <div className="mb-6">
                    <h4 className="font-medium mb-2">Categories</h4>
                    {categories.map(category => (
                      <div key={category} className="flex items-center space-x-2 mb-2">
                        <Checkbox
                          id={category}
                          checked={selectedCategories.includes(category)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedCategories([...selectedCategories, category]);
                            } else {
                              setSelectedCategories(selectedCategories.filter(c => c !== category));
                            }
                          }}
                        />
                        <label htmlFor={category} className="text-sm">{category}</label>
                      </div>
                    ))}
                  </div>

                  {/* Ratings */}
                  <div className="mb-6">
                    <h4 className="font-medium mb-2">Minimum Rating</h4>
                    {[4, 3, 2, 1].map(rating => (
                      <div key={rating} className="flex items-center space-x-2 mb-2">
                        <Checkbox
                          id={`rating-${rating}`}
                          checked={selectedRatings.includes(rating)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedRatings([...selectedRatings, rating]);
                            } else {
                              setSelectedRatings(selectedRatings.filter(r => r !== rating));
                            }
                          }}
                        />
                        <label htmlFor={`rating-${rating}`} className="text-sm">{rating}+ Stars</label>
                      </div>
                    ))}
                  </div>

                  {/* Location */}
                  <div className="mb-6">
                    <h4 className="font-medium mb-2">Location</h4>
                    {locations.map(location => (
                      <div key={location} className="flex items-center space-x-2 mb-2">
                        <Checkbox
                          id={location}
                          checked={selectedLocations.includes(location)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedLocations([...selectedLocations, location]);
                            } else {
                              setSelectedLocations(selectedLocations.filter(l => l !== location));
                            }
                          }}
                        />
                        <label htmlFor={location} className="text-sm">{location}</label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </FadeIn>

            {/* Main Content */}
            <FadeIn delay={200}>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-6">
                  <h1 className="text-2xl font-bold text-gray-900">Products</h1>
                  <p className="text-gray-600">{filteredProducts.length} products found</p>
                </div>

                {loading ? (
                  <div className="text-center py-12">
                    <div className="w-8 h-8 border-2 border-gray-300 border-t-primary-600 rounded-full animate-spin mx-auto"></div>
                    <p className="text-gray-500 mt-4">Loading products...</p>
                  </div>
                ) : (
                  <ProductGrid
                    products={filteredProducts}
                    onViewDetails={handleViewDetails}
                  />
                )}
              </div>
            </FadeIn>
          </div>
        </div>
      </PageTransition>
    </div>
  );
}