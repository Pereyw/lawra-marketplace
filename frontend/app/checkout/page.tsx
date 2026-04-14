'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useAuth } from '@/lib/auth-context';
import { useCart } from '@/lib/cart-context';
import { saveUserOrder } from '@/lib/local-orders';
import { Order, ShippingInfo } from '@/types';
import { CheckCircle, CreditCard, Truck } from 'lucide-react';
import { PageTransition, FadeIn } from '@/components/ui/page-transition';

declare global {
  interface Window {
    PaystackPop?: any;
  }
}

const initialShippingInfo: ShippingInfo = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  region: '',
  postalCode: '',
};

const createOrderReference = () => `LAWRA-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

export default function CheckoutPage() {
  const { user, loading } = useAuth();
  const { state, dispatch } = useCart();
  const router = useRouter();
  const [shippingInfo, setShippingInfo] = useState<ShippingInfo>(initialShippingInfo);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'mobile' | 'cash'>('card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paystackLoaded, setPaystackLoaded] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const [orderPlaced, setOrderPlaced] = useState(false);

  const shippingCost = 10;
  const tax = state.total * 0.1;
  const total = state.total + shippingCost + tax;
  const paystackKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY;

  useEffect(() => {
    if (paymentMethod === 'cash') {
      return;
    }

    if (typeof window === 'undefined') {
      return;
    }

    if ((window as any).PaystackPop) {
      setPaystackLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://js.paystack.co/v1/inline.js';
    script.async = true;
    script.onload = () => setPaystackLoaded(true);
    script.onerror = () => setPaymentError('Unable to load Paystack checkout. Please try again later.');
    document.body.appendChild(script);

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, [paymentMethod]);

  const handleShippingChange = (field: keyof ShippingInfo, value: string) => {
    setShippingInfo((prev) => ({ ...prev, [field]: value }));
  };

  const createOrder = (paymentStatus: 'pending' | 'paid' | 'failed', status: 'Processing' | 'Paid' | 'Delivered' | 'Cancelled'): Order => ({
    id: `${Date.now()}-${Math.random().toString(16).slice(2, 10)}`,
    userId: user?.id ?? 0,
    reference: createOrderReference(),
    items: state.items,
    shipping: shippingInfo,
    paymentMethod,
    paymentStatus,
    total,
    shippingCost,
    tax,
    status,
    createdAt: new Date().toISOString(),
  });

  const persistOrder = (order: Order) => {
    if (!user) return;
    saveUserOrder(user.id, order);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!user) {
      router.push('/auth/login');
      return;
    }

    if (state.items.length === 0) {
      router.push('/cart');
      return;
    }

    setPaymentError('');
    setIsProcessing(true);

    if (paymentMethod === 'cash') {
      const order = createOrder('pending', 'Processing');
      persistOrder(order);
      dispatch({ type: 'CLEAR_CART' });
      setOrderPlaced(true);
      setIsProcessing(false);
      return;
    }

    if (!paystackKey) {
      setPaymentError('Paystack public key is not configured.');
      setIsProcessing(false);
      return;
    }

    if (!paystackLoaded) {
      setPaymentError('Paystack checkout is not ready yet. Please wait a moment.');
      setIsProcessing(false);
      return;
    }

    const paystack = window.PaystackPop;
    if (!paystack) {
      setPaymentError('Unable to initialize Paystack. Please refresh and try again.');
      setIsProcessing(false);
      return;
    }

    const orderReference = createOrderReference();
    const baseOrder = createOrder('pending', 'Processing');

    paystack.setup({
      key: paystackKey,
      email: shippingInfo.email,
      amount: Math.round(total * 100),
      currency: 'GHS',
      ref: orderReference,
      metadata: {
        custom_fields: [
          {
            display_name: 'Phone Number',
            variable_name: 'phone_number',
            value: shippingInfo.phone,
          },
        ],
      },
      callback: () => {
        persistOrder({ ...baseOrder, reference: orderReference, paymentStatus: 'paid', status: 'Paid' });
        dispatch({ type: 'CLEAR_CART' });
        router.push('/orders');
      },
      onClose: () => {
        setPaymentError('Payment was not completed. Please try again.');
        setIsProcessing(false);
      },
    });
  };

  if (!user && !loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <PageTransition direction="up">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center animate-slideInUp">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Please log in to checkout</h1>
            <p className="text-gray-600 mb-8">
              Sign in to continue and review your order history after checkout.
            </p>
            <div className="flex justify-center gap-4 animate-slideInUp" style={{ animationDelay: '150ms' }}>
              <Button onClick={() => router.push('/auth/login')}>Login</Button>
              <Button variant="outline" onClick={() => router.push('/auth/register')}>Sign Up</Button>
            </div>
          </div>
        </PageTransition>
      </div>
    );
  }

  if (state.items.length === 0) {
    router.push('/cart');
    return null;
  }

  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <PageTransition direction="up">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <FadeIn>
              <div className="rounded-3xl border border-gray-200 bg-white p-12 text-center shadow-sm animate-popIn">
                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100 animate-popIn">
                  <CheckCircle className="h-10 w-10 text-green-600" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-4 animate-slideInUp" style={{ animationDelay: '150ms' }}>Order confirmed</h1>
                <p className="text-gray-600 mb-8 animate-slideInUp" style={{ animationDelay: '300ms' }}>
                  Your order has been placed successfully. You can review it in your order history.
                </p>
                <div className="flex flex-col gap-4 sm:flex-row sm:justify-center animate-slideInUp" style={{ animationDelay: '450ms' }}>
                  <Button onClick={() => router.push('/orders')}>View Orders</Button>
                  <Button variant="outline" onClick={() => router.push('/products')}>Continue Shopping</Button>
                </div>
              </div>
            </FadeIn>
          </div>
        </PageTransition>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <PageTransition direction="up">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8 animate-slideInUp">Checkout</h1>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <FadeIn delay={100}>
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Truck className="w-5 h-5" />
                      Shipping Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <Label htmlFor="firstName">First Name</Label>
                        <Input
                          id="firstName"
                          value={shippingInfo.firstName}
                          onChange={(e) => handleShippingChange('firstName', e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                          id="lastName"
                          value={shippingInfo.lastName}
                          onChange={(e) => handleShippingChange('lastName', e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={shippingInfo.email}
                        onChange={(e) => handleShippingChange('email', e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        value={shippingInfo.phone}
                        onChange={(e) => handleShippingChange('phone', e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="address">Address</Label>
                      <Input
                        id="address"
                        value={shippingInfo.address}
                        onChange={(e) => handleShippingChange('address', e.target.value)}
                        required
                      />
                    </div>
                    <div className="grid gap-4 md:grid-cols-3">
                      <div>
                        <Label htmlFor="city">City</Label>
                        <Input
                          id="city"
                          value={shippingInfo.city}
                          onChange={(e) => handleShippingChange('city', e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="region">Region</Label>
                        <Input
                          id="region"
                          value={shippingInfo.region}
                          onChange={(e) => handleShippingChange('region', e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="postalCode">Postal Code</Label>
                        <Input
                          id="postalCode"
                          value={shippingInfo.postalCode}
                          onChange={(e) => handleShippingChange('postalCode', e.target.value)}
                          required
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CreditCard className="w-5 h-5" />
                      Payment Method
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <RadioGroup value={paymentMethod} onValueChange={(value) => setPaymentMethod(value as 'card' | 'mobile' | 'cash')}>
                      <div className="flex items-center gap-3">
                        <RadioGroupItem value="card" id="card" />
                        <Label htmlFor="card">Credit/Debit Card</Label>
                      </div>
                      <div className="flex items-center gap-3">
                        <RadioGroupItem value="mobile" id="mobile" />
                        <Label htmlFor="mobile">Mobile Money</Label>
                      </div>
                      <div className="flex items-center gap-3">
                        <RadioGroupItem value="cash" id="cash" />
                        <Label htmlFor="cash">Cash on Delivery</Label>
                      </div>
                    </RadioGroup>

                    <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-600">
                      {paymentMethod === 'card' && (
                        <p>Pay securely with your card through Paystack. Your card details are handled by Paystack.</p>
                      )}
                      {paymentMethod === 'mobile' && (
                        <p>Use Paystack mobile money checkout to complete payment instantly.</p>
                      )}
                      {paymentMethod === 'cash' && (
                        <p>Pay in cash when your order is delivered. Your order will be saved immediately.</p>
                      )}
                    </div>

                    {paymentError && (
                      <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                        {paymentError}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </FadeIn>

            <FadeIn delay={200}>
              <div className="lg:col-span-1">
                <Card className="sticky top-4">
                  <CardHeader>
                    <CardTitle>Order Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      {state.items.map((item) => (
                        <div key={item.id} className="flex justify-between text-sm">
                          <span>{item.title} (x{item.quantity})</span>
                          <span>₵{(item.price * item.quantity).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                    <hr />
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Subtotal</span>
                      <span>₵{state.total.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Shipping</span>
                      <span>₵{shippingCost.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Tax</span>
                      <span>₵{tax.toFixed(2)}</span>
                    </div>
                    <hr />
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span>₵{total.toFixed(2)}</span>
                    </div>
                    <Button type="submit" className="w-full" size="lg" disabled={isProcessing}>
                      {isProcessing ? 'Processing...' : 'Place Order'}
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </FadeIn>
          </form>
        </div>
      </PageTransition>
    </div>
  );
}
