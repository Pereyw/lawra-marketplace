# Lawra Marketplace - Frontend

A Next.js frontend for the Lawra municipality e-commerce platform that connects landlords, artisans, and service providers with customers.

## Features

- **Authentication**: JWT-based login and registration with role-based access
- **Dashboard**: Role-specific dashboards for landlords, artisans, service providers, customers, and admins
- **Property Listings**: Browse, search, and filter rental properties
- **Responsive Design**: Mobile-first design with Tailwind CSS
- **API Integration**: Full integration with the backend API

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Context
- **HTTP Client**: Axios
- **Form Handling**: React Hook Form
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Backend API running on `http://localhost:5000`

### Installation

1. Clone the repository and navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create environment file:
   ```bash
   cp .env.example .env.local
   ```

4. Update the environment variables in `.env.local`:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000/api
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
frontend/
├── app/                    # Next.js App Router
│   ├── auth/              # Authentication pages
│   │   ├── login/         # Login page
│   │   └── register/      # Registration page
│   ├── dashboard/         # Dashboard page
│   ├── properties/        # Properties listing page
│   ├── globals.css        # Global styles
│   └── layout.tsx         # Root layout
├── components/            # Reusable components
│   ├── dashboard/         # Dashboard components
│   └── ui/                # UI components
├── lib/                   # Utilities and configurations
│   ├── api.ts            # API client and endpoints
│   └── auth-context.tsx  # Authentication context
├── types/                 # TypeScript type definitions
└── hooks/                 # Custom React hooks
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## User Roles

### Customer
- Browse and search properties
- View artisan products and services
- Book properties and services
- Send inquiries and messages

### Landlord
- List rental properties
- Manage property listings
- View booking requests
- Communicate with potential tenants

### Artisan
- Create product/service listings
- Manage inventory and pricing
- Receive orders and inquiries
- Communicate with customers

### Service Provider
- Offer professional services
- Set availability and pricing
- Manage service bookings
- Communicate with clients

### Admin
- Moderate listings and users
- View platform analytics
- Manage system settings
- Approve/reject new registrations

## API Integration

The frontend connects to the backend API with the following key endpoints:

- **Authentication**: `/auth/login`, `/auth/register`, `/auth/me`
- **Properties**: `/properties`, `/properties/:id`, `/properties/landlord/mine`
- **Artisans**: `/artisans`, `/artisans/:id`, `/artisans/me/listings`
- **Services**: `/services`, `/services/:id`, `/services/provider/mine`
- **Bookings**: `/bookings`, `/bookings/user/me`, `/bookings/provider/mine`
- **Messages**: `/messages`, `/messages/conversation/:user_id`

## Contributing

1. Follow the existing code style and structure
2. Use TypeScript for all new code
3. Test components and API integrations
4. Update documentation as needed

## License

This project is licensed under the MIT License.