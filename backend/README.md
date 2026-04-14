# Lawra Marketplace Backend API

Community-based e-commerce platform for Lawra municipality connecting landlords, artisans, and service providers.

## Project Structure

```
backend/
├── models/              # Database models
│   ├── User.js
│   └── Property.js
├── services/            # Business logic
│   ├── AuthService.js
│   └── PropertyService.js
├── controllers/         # HTTP request handlers
│   ├── AuthController.js
│   └── PropertyController.js
├── middleware/          # Express middleware
│   └── auth.js
├── routes/              # API route definitions
│   └── api.js
├── database/            # Database configuration
│   └── schema.js
├── app.js               # Main application
├── package.json         # Dependencies
├── .env.example         # Environment variables template
└── README.md
```

## Architecture

### Clean Architecture Principles:
- **Model Layer**: Database operations only
- **Service Layer**: Business logic and validation
- **Controller Layer**: HTTP request/response handling
- **Middleware**: Authentication, authorization, error handling

### Separation of Concerns:
- Each module has a single responsibility
- Loose coupling between components
- Reusable and testable code

## Setup Instructions

### Prerequisites
- Node.js 14+
- PostgreSQL 12+
- npm or yarn

### Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure environment**:
   ```bash
   cp .env.example .env
   # Edit .env with your database and API credentials
   ```

3. **Create database**:
   ```bash
   createdb lawra_marketplace
   ```

4. **Start server**:
   ```bash
   # Development (with hot reload)
   npm run dev

   # Production
   npm start
   ```

The API will be available at `http://localhost:5000/api`

## API Endpoints

### Authentication

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | No | Register new user |
| POST | `/api/auth/login` | No | Login user |
| POST | `/api/auth/refresh` | Yes | Refresh token |
| GET | `/api/auth/me` | Yes | Get current user |
| POST | `/api/auth/logout` | Yes | Logout user |

### Properties (Public)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/properties` | No | Browse all properties |
| GET | `/api/properties/:id` | No | Get single property |
| GET | `/api/properties/search/nearby` | No | Search by location |
| GET | `/api/properties/search/price` | No | Search by price |

### Properties (Landlord)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/properties` | Yes | Create property |
| GET | `/api/properties/landlord/mine` | Yes | Get my properties |
| PUT | `/api/properties/:id` | Yes | Update property |
| DELETE | `/api/properties/:id` | Yes | Delete property |

## Request/Response Examples

### Register User
```bash
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "0241234567",
  "password": "secure123",
  "role": "landlord"
}

Response:
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "role": "landlord"
    },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

### Create Property
```bash
POST /api/properties
Content-Type: application/json
Authorization: Bearer YOUR_TOKEN

{
  "title": "Modern 2-Bedroom House",
  "description": "Beautiful house in quiet neighborhood with all amenities",
  "price": 5000,
  "location_lat": 10.3183,
  "location_lng": -2.4194,
  "utilities": ["water", "electricity", "internet"],
  "images": ["url1", "url2"],
  "bedrooms": 2,
  "bathrooms": 1,
  "area_sqm": 150
}

Response:
{
  "success": true,
  "message": "Property created successfully",
  "data": {
    "id": 1,
    "landlord_id": 1,
    "title": "Modern 2-Bedroom House",
    ...
  }
}
```

### Search Nearby Properties
```bash
GET /api/properties/search/nearby?latitude=10.3183&longitude=-2.4194&radius=5

Response:
{
  "success": true,
  "data": [...],
  "count": 12,
  "searchParams": {
    "center": { "latitude": "10.3183", "longitude": "-2.4194" },
    "radiusKm": "5"
  }
}
```

## Authentication

The API uses JWT (JSON Web Tokens) for authentication:

1. Register or login to get a token
2. Include token in request header:
   ```
   Authorization: Bearer YOUR_JWT_TOKEN
   ```

## Error Handling

All errors return consistent format:
```json
{
  "success": false,
  "message": "Error description"
}
```

HTTP Status Codes:
- `200`: Success
- `201`: Created
- `400`: Bad request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not found
- `500`: Server error

## Database Schema

Key tables:
- **users**: User accounts and profiles
- **properties**: Property listings
- **bookings**: Property/service bookings
- **payments**: Transaction records
- **messages**: User communications
- **reviews**: User reviews and ratings

See `database/schema.js` for complete schema.

## Security Features

- ✓ Password hashing with bcrypt
- ✓ JWT token authentication
- ✓ Role-based access control (RBAC)
- ✓ Input validation and sanitization
- ✓ Rate limiting
- ✓ Error message sanitization
- ✓ Secure database transactions

## Testing

```bash
npm test
```

## Environment Variables

See `.env.example` for all available configuration options.

## Contributing

1. Create a feature branch
2. Make your changes
3. Commit with clear messages
4. Push and create a pull request

## License

MIT

## Support

For issues or questions, please contact the development team.
