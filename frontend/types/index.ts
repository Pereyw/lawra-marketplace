// User types
export interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: 'user' | 'landlord' | 'artisan' | 'service_provider' | 'admin';
  created_at: string;
  updated_at: string;
}

export interface AuthUser extends User {
  token?: string;
}

// Property types
export interface Property {
  id: number;
  landlord_id: number;
  title: string;
  description: string;
  price: number;
  location_lat: number;
  location_lng: number;
  utilities: string[];
  images: string[];
  status: 'available' | 'rented' | 'pending';
  created_at: string;
  updated_at: string;
  landlord?: User;
}

// Artisan listing types
export interface ArtisanListing {
  id: number;
  artisan_id: number;
  title: string;
  description: string;
  price: number;
  images: string[];
  category: string;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
  artisan?: User;
}

// Service types
export interface Service {
  id: number;
  provider_id: number;
  service_name: string;
  description: string;
  price: number;
  category: string;
  availability: string[];
  images: string[];
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
  provider?: User;
}

// Booking types
export interface Booking {
  id: number;
  user_id: number;
  service_id?: number;
  property_id?: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  booking_date: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  user?: User;
  service?: Service;
  property?: Property;
}

// Message types
export interface Message {
  id: number;
  sender_id: number;
  receiver_id: number;
  message: string;
  is_read: boolean;
  related_type?: 'property' | 'artisan' | 'service' | 'booking';
  related_id?: number;
  created_at: string;
  sender?: User;
  receiver?: User;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Form types
export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterForm {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: 'user' | 'landlord' | 'artisan' | 'service_provider';
}

export interface PropertyForm {
  title: string;
  description: string;
  price: number;
  location_lat: number;
  location_lng: number;
  utilities: string[];
  images: File[];
}

export interface OrderItem {
  id: string;
  title: string;
  price: number;
  image: string;
  quantity: number;
  seller: string;
}

export interface ShippingInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  region: string;
  postalCode: string;
}

export interface Order {
  id: string;
  userId: number;
  reference: string;
  items: OrderItem[];
  shipping: ShippingInfo;
  paymentMethod: 'card' | 'mobile' | 'cash';
  paymentStatus: 'pending' | 'paid' | 'failed';
  total: number;
  shippingCost: number;
  tax: number;
  status: 'Processing' | 'Paid' | 'Delivered' | 'Cancelled';
  createdAt: string;
}

// Filter types
export interface PropertyFilters {
  minPrice?: number;
  maxPrice?: number;
  utilities?: string[];
  location?: {
    lat: number;
    lng: number;
    radius: number;
  };
}

export interface SearchFilters {
  query?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  location?: {
    lat: number;
    lng: number;
    radius: number;
  };
}