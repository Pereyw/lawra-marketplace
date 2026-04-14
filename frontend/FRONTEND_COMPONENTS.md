# Frontend Components & Features Guide

Complete guide to the advanced e-commerce frontend components created for Lawra municipality marketplace.

## Table of Contents
1. [Authentication & Utilities](#authentication--utilities)
2. [Payment System](#payment-system)
3. [Feature Components](#feature-components)
4. [Admin Components](#admin-components)
5. [Integration Guide](#integration-guide)
6. [Usage Examples](#usage-examples)

---

## Authentication & Utilities

### `lib/auth.ts` - AuthManager
Centralized authentication management with token handling and role checking.

```typescript
// Check if user is authenticated
if (AuthManager.isAuthenticated()) {
  // User has valid token
}

// Get current user
const user = AuthManager.getCurrentUser(); // { userId, email, role }

// Role checks
if (AuthManager.isAdmin()) { /* ... */ }
if (AuthManager.isLandlord()) { /* ... */ }
if (AuthManager.isArtisan()) { /* ... */ }

// Token management
AuthManager.setAuthTokens(token, refreshToken);
AuthManager.clearAuthTokens();
AuthManager.isTokenExpired();
```

### `hooks/useAuth.ts` - Authentication Hook
React hook for authentication with automatic token refresh.

```typescript
function MyComponent() {
  const {
    user,
    isLoading,
    isAuthenticated,
    isAdmin,
    login,
    register,
    logout,
    error,
    clearError
  } = useAuth();

  const handleLogin = async () => {
    try {
      await login(email, password);
      // Redirect to dashboard
    } catch (err) {
      console.error('Login failed:', err);
    }
  };

  if (!isAuthenticated) return <Redirect to="/auth/login" />;
  
  return <Dashboard user={user} />;
}
```

### `hooks/useSocket.ts` - WebSocket Hook
Real-time communication via Socket.io for messaging, notifications, and live updates.

```typescript
function ChatComponent() {
  const {
    isConnected,
    messages,
    isTyping,
    sendMessage,
    getMessages,
    subscribeTo Booking,
  } = useSocket();

  // Send a message
  sendMessage(recipientId, 'Hello!');

  // Subscribe to booking updates
  useEffect(() => {
    subscribeToBooking(bookingId);
  }, [bookingId]);

  // Listen for budget updates
  useEffect(() => {
    const handleUpdate = (update) => {
      console.log('Booking updated:', update);
    };
    window.addEventListener('bookingUpdated', handleUpdate);
    return () => window.removeEventListener('bookingUpdated', handleUpdate);
  }, []);
}
```

### `lib/api.ts` - API Client
Enhanced API client with feature-specific endpoints.

```typescript
// Verification
await verificationsApi.submit(formData); // Submit KYC
await verificationsApi.getStatus(); // Check status

// Reviews
await reviewsApi.create(reviewData); // Create review
await reviewsApi.getForProperty(propertyId); // Get property reviews

// Payments
await paymentsApi.create(paymentData); // Create payment
await paymentsApi.verify(paymentId, verificationData);

// Notifications
await notificationsApi.getAll(limit, offset);
await notificationsApi.markAsRead(notificationId);
```

### `lib/payment-mock.ts` - Mock Payment Provider
Simulates Mobile Money and card payment processing for testing.

```typescript
// Initiate payment
const response = await mockPaymentProvider.initiatePayment({
  amount: 150,
  currency: 'GHS',
  customername: 'John',
  customerPhone: '+233501234567',
  customerEmail: 'john@example.com',
  paymentMethod: 'mtn_money',
  externalId: 'BOOKING_123',
  callbackUrl: 'http://localhost:3000/callback',
});

// Get transaction status
const status = await mockPaymentProvider.getTransactionStatus(transactionId);

// Verify payment
const verified = await mockPaymentProvider.verifyPayment(transactionId);

// Refund
const refund = await mockPaymentProvider.refundTransaction(transactionId);

// Helper functions
PaymentHelper.formatAmount(150); // GHS 150.00
PaymentHelper.calculateFees(150, 'mtn_money'); // 1%
PaymentHelper.validatePaymentRequest(request);
```

---

## Payment System

### `components/features/PaymentForm.tsx`
Complete payment form with escrow support and mock payment provider integration.

**Features:**
- Multiple payment methods (Mobile Money, Cards)
- Automatic fee calculation
- Secure escrow holding
- Transaction verification
- Real-time status updates

**Usage:**
```typescript
import { PaymentForm } from '@/components/features/PaymentForm';

export function BookingPage() {
  return (
    <PaymentForm
      bookingId={123}
      amount={150.00}
      description="Cleaning service"
      onPaymentSuccess={(transactionId) => {
        console.log('Payment successful:', transactionId);
        redirectToConfirmation();
      }}
    />
  );
}
```

**Props:**
- `bookingId: number` - Associated booking
- `amount: number` - Payment amount in GHS  
- `description: string` - Payment description
- `onPaymentSuccess?: (transactionId: string) => void` - Success callback

---

## Feature Components

### 1. KYC Verification
**File:** `components/features/VerificationUpload.tsx`

Upload ID documents and track verification status.

```typescript
import { VerificationUpload } from '@/components/features/VerificationUpload';

export default function VerificationPage() {
  return <VerificationUpload />;
}
```

**Features:**
- Document type selection (Ghana Card, Passport, Driver's License)
- File upload validation
- Real-time status tracking (pending, approved, rejected)
- Admin approval/rejection workflow
- Verification badge on profile

---

### 2. Reviews & Ratings
**File:** `components/features/ReviewForm.tsx`

Submit and display user reviews with star ratings.

```typescript
import { ReviewForm, ReviewDisplay } from '@/components/features/ReviewForm';

export function BookingCompletion({ bookingId, providerId }) {
  const [reviews, setReviews] = useState([]);

  return (
    <div className="grid grid-cols-2 gap-6">
      <ReviewForm
        revieweeId={providerId}
        bookingId={bookingId}
        onSubmitSuccess={() => loadReviews()}
      />
      <ReviewDisplay reviews={reviews} isLoading={false} />
    </div>
  );
}
```

**ReviewForm Props:**
- `revieweeId: number` - User being reviewed
- `bookingId: number` - Associated booking
- `onSubmitSuccess?: () => void` - Callback after submission

**ReviewDisplay Props:**
- `reviews: any[]` - Array of review objects
- `isLoading?: boolean` - Loading state

**Features:**
- 5-star rating system
- Text review with title
- Automatic duplicate prevention
- Average rating calculation
- Filter by rating

---

### 3. Real-Time Chat
**File:** `components/features/ChatInterface.tsx`

Real-time messaging with typing indicators and read receipts.

```typescript
import { ChatInterface } from '@/components/features/ChatInterface';

export function Messages() {
  const [selectedUser, setSelectedUser] = useState(2);

  return (
    <div className="h-screen">
      <ChatInterface
        recipientId={selectedUser}
        recipientName="John Doe"
      />
    </div>
  );
}
```

**Props:**
- `recipientId: number` - User to chat with
- `recipientName: string` - Display name

**Features:**
- Real-time message delivery via WebSocket
- Typing indicators
- Read receipts
- Message history
- Online status indicator

---

### 4. Payments & Escrow
**File:** `components/features/PaymentForm.tsx`

Already covered above in [Payment System](#payment-system) section.

---

### 5. Notifications
**File:** `components/features/NotificationsPanel.tsx`

Real-time notifications with filtering and management.

```typescript
import { NotificationsPanel } from '@/components/features/NotificationsPanel';

export function NotificationCenter() {
  return <NotificationsPanel />;
}
```

**Features:**
- Real-time notification delivery
- Filter by type (booking, payment, message, review, dispute, verification)
- Unread badge
- Mark as read
- Delete notifications
- Online status indicator

---

### 6. Disputes
**File:** `components/features/DisputeForm.tsx`

File and track disputes with resolution workflow.

```typescript
import { DisputeForm, DisputeList } from '@/components/features/DisputeForm';

export function BookingIssue({ bookingId }) {
  return (
    <>
      <DisputeForm
        bookingId={bookingId}
        otherPartyName="John Doe"
        onSubmitSuccess={() => console.log('Dispute filed')}
      />
    </>
  );
}
```

**DisputeForm Props:**
- `bookingId: number` - Associated booking
- `otherPartyName: string` - Other party name
- `onSubmitSuccess?: () => void` - Callback

**DisputeList Props:**
- `onlyMyDisputes?: boolean` - Filter to user's disputes only

**Features:**
- File disputes with evidence
- Track status (open, under_review, resolved, closed)
- Admin resolution workflow
- Evidence attachment
- Automatic escrow handling

---

### 7. Featured Listings
**File:** `components/features/FeaturedListingsComponent.tsx`

Boost listing visibility with premium featuring.

```typescript
import { FeaturedListingsComponent } from '@/components/features/FeaturedListingsComponent';

export function ListingBoost({ listingId }) {
  return (
    <FeaturedListingsComponent
      listingId={listingId}
      listingType="property"
      currentlyFeatured={false}
    />
  );
}
```

**Props:**
- `listingId: number` - Listing to feature
- `listingType: 'property' | 'artisan' | 'service'` - Listing category
- `currentlyFeatured?: boolean` - Current featuring status
- `expiresAt?: string` - Featured expiration date

**Features:**
- Multiple duration options
- Automatic fee calculation  
- Payment integration
- Extend existing features
- Featured badge on listings
- Analytics for featured listings

---

## Admin Components

### 1. Admin Dashboard
**File:** `components/admin/AdminDashboard.tsx`

Platform-wide analytics and KPI overview.

```typescript
import { AdminDashboard } from '@/components/admin/AdminDashboard';

export default function Dashboard() {
  return <AdminDashboard />;
}
```

**Features:**
- Total bookings KPI
- Revenue tracking
- Active users count
- Top vendors listing
- Booking status breakdown
- Recent activity log
- Date range filtering (7/30/90/365 days)

---

### 2. Verification Dashboard
**File:** `components/admin/VerificationDashboard.tsx`

Manage KYC verifications with document preview.

```typescript
import { VerificationDashboard } from '@/components/admin/VerificationDashboard';

export function VerificationsPage() {
  return <VerificationDashboard />;
}
```

**Features:**
- Pending verifications list
- Document preview
- User information display
- Approve/Reject actions
- Status tracking

---

### 3. Dispute Management
**File:** `components/admin/DisputeManagement.tsx`

Resolve disputes with detailed case tracking.

```typescript
import { DisputeManagement } from '@/components/admin/DisputeManagement';

export function DisputesPage() {
  return <DisputeManagement />;
}
```

**Features:**
- Active disputes list
- Dispute details and evidence
- Resolution decision options:
  - Refund customer
  - Uphold service provider
  - Partial refund
- Automatic compensation handling
- Status tracking

---

### 4. Admin Page
**File:** `app/admin/page.tsx`

Complete admin interface with tabbed navigation.

```typescript
// Access at /admin
// Includes:
// - Dashboard tab
// - Verifications tab
// - Disputes tab
// - Responsive sidebar
// - Admin header with user info
```

---

## Integration Guide

### Step 1: Install Dependencies

```bash
npm install socket.io-client
```

> socket.io-client already added to package.json

### Step 2: Setup Auth Provider

Wrap your app with auth context:

```typescript
// app/layout.tsx
import { AuthProvider } from '@/lib/auth-context';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html>
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
```

### Step 3: Use Components in Pages

```typescript
// app/verification/page.tsx
'use client';

import { VerificationUpload } from '@/components/features/VerificationUpload';

export default function VerificationPage() {
  return (
    <div className="container mx-auto py-8">
      <VerificationUpload />
    </div>
  );
}
```

### Step 4: Protect Admin Routes

```typescript
// middleware.ts
import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  // Check if user is admin
  const token = request.cookies.get('token');
  
  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (!token) {
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }
    // In production, decode and verify token
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/payment/:path*']
};
```

---

## Usage Examples

### Complete Booking Flow

```typescript
'use client';

import { useState } from 'react';
import { ChatInterface } from '@/components/features/ChatInterface';
import { PaymentForm } from '@/components/features/PaymentForm';
import { ReviewForm } from '@/components/features/ReviewForm';
import { DisputeForm } from '@/components/features/DisputeForm';

export default function BookingPage({ params }: { params: { id: string } }) {
  const bookingId = parseInt(params.id);
  const [step, setStep] = useState<'chat' | 'payment' | 'review' | 'dispute'>('chat');

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Booking #{bookingId}</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {step === 'chat' && (
            <ChatInterface recipientId={2} recipientName="Service Provider" />
          )}
          {step === 'payment' && (
            <PaymentForm
              bookingId={bookingId}
              amount={150}
              description="Service booking payment"
              onPaymentSuccess={() => setStep('review')}
            />
          )}
          {step === 'review' && (
            <ReviewForm
              revieweeId={2}
              bookingId={bookingId}
              onSubmitSuccess={() => setStep('dispute')}
            />
          )}
          {step === 'dispute' && (
            <DisputeForm
              bookingId={bookingId}
              otherPartyName="Service Provider"
            />
          )}
        </div>

        {/* Sidebar Navigation */}
        <div className="space-y-2">
          {['chat', 'payment', 'review', 'dispute'].map((s) => (
            <button
              key={s}
              onClick={() => setStep(s as any)}
              className={`w-full px-4 py-2 rounded text-left font-medium ${
                step === s
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
```

### Dashboard with Notifications

```typescript
'use client';

import { useAuth } from '@/hooks/useAuth';
import { NotificationsPanel } from '@/components/features/NotificationsPanel';
import { AdminDashboard } from '@/components/admin/AdminDashboard';

export default function DashboardPage() {
  const { user, isAdmin } = useAuth();

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="grid grid-cols-4 gap-6 p-6">
        {/* Main Content */}
        <div className="col-span-3">
          {isAdmin ? <AdminDashboard /> : <UserDashboard />}
        </div>

        {/* Notifications Sidebar */}
        <div className="bg-white rounded-lg shadow p-4">
          <NotificationsPanel />
        </div>
      </div>
    </div>
  );
}
```

---

## Component Architecture

```
frontend/
├── lib/
│   ├── api.ts (Enhanced API client)
│   ├── auth.ts (Authentication manager)
│   ├── payment-mock.ts (Mock payments)
│   └── auth-context.tsx (Auth provider)
├── hooks/
│   ├── useAuth.ts (Auth hook with token refresh)
│   └── useSocket.ts (WebSocket hook)
├── components/
│   ├── features/
│   │   ├── VerificationUpload.tsx
│   │   ├── ReviewForm.tsx
│   │   ├── ChatInterface.tsx
│   │   ├── PaymentForm.tsx
│   │   ├── NotificationsPanel.tsx
│   │   ├── DisputeForm.tsx
│   │   ├── FeaturedListingsComponent.tsx
│   │   └── BookingCalendar.tsx
│   └── admin/
│       ├── AdminDashboard.tsx
│       ├── VerificationDashboard.tsx
│       ├── DisputeManagement.tsx
│       └── (more admin components)
└── app/
    ├── admin/
    │   └── page.tsx (Admin panel)
    ├── verification/
    │   └── page.tsx
    ├── bookings/
    │   └── [id]/
    │       └── page.tsx
    └── (other pages)
```

---

## Testing Checklist

- [ ] Login/Logout works
- [ ] Token automatically refreshes before expiry
- [ ] Verification upload succeeds
- [ ] Review submission prevents duplicates
- [ ] Chat messages send/receive in real-time
- [ ] Typing indicators work
- [ ] Notifications appear in real-time
- [ ] Payment form calculates fees correctly
- [ ] Escrow holds funds securely
- [ ] Dispute filing works
- [ ] Admin dashboard loads
- [ ] Admin can approve/reject verifications
- [ ] Admin can resolve disputes
- [ ] Featured listing boost works
- [ ] All status badges display correctly

---

## Security Notes

1. **Token Management:**
   - Tokens stored in localStorage (consider moving to HttpOnly cookies)
   - Auto-refresh 5 minutes before expiry
   - Clear on logout

2. **API Requests:**
   - All requests include JWT in Authorization header
   - CORS configured for frontend URL
   - Input validation on all forms

3. **Role-Based Access:**
   - Admin routes protected
   - Role checks on sensitive operations
   - Verification badges only on approved users

4. **Payment:**
   - Mock provider for testing only
   - Real provider credentials in production
   - PCI compliance required
   - SSL/HTTPS mandatory

---

## Performance Tips

1. **Image Optimization:**
   - Use Next.js Image component
   - Lazy load images
   - WebP format for modern browsers

2. **Network:**
   - Pagination on lists
   - Debounce search inputs
   - Cache frequently accessed data

3. **WebSocket:**
   - Reconnect with backoff
   - Unsubscribe from unused rooms
   - Clean disconnection handling

4. **Components:**
   - Memoize expensive components
   - Split large forms
   - Lazy load admin pages

---

## Troubleshooting

**WebSocket not connecting?**
- Check FRONTEND_URL in .env
- Verify backend Socket.io running
- Check browser console for CORS errors

**Payments failing?**
- Verify mock provider initialized
- Check transaction ID format
- See dev console for payment logs

**Reviews showing duplicates?**
- Backend checks bookingId + userId
- Clear cache if needed
- Verify API response

**Auth not persisting?**
- Check localStorage available
- Verify token saved on login
- Check token expiry time

---

## Next Steps

1. **Frontend Integration:**
   - Connect all components to pages
   - Style with TailwindCSS
   - Add loading states

2. **Backend Connection:**
   - Verify all API endpoints respond
   - Test token refresh
   - Test WebSocket events

3. **Testing:**
   - Unit tests for hooks
   - Integration tests for flows
   - E2E tests with Cypress

4. **Deployment:**
   - Environment variables
   - Build optimization
   - CDN for static assets

