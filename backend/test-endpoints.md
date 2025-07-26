# ClosetLoop API Test Commands

This document contains curl commands to test all the API endpoints.

## Prerequisites
- Backend server running on `http://localhost:5000`
- MongoDB connected and running
- Environment variables configured

## Authentication Endpoints

### 1. Sign Up
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "Password123",
    "role": "user"
  }'
```

### 2. Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "Password123"
  }'
```

### 3. Get Current User Profile
```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 4. Logout
```bash
curl -X POST http://localhost:5000/api/auth/logout \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Profile Management

### 5. Get User Profile
```bash
curl -X GET http://localhost:5000/api/users/USER_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 6. Update User Profile
```bash
curl -X PATCH http://localhost:5000/api/users/USER_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "name": "John Updated",
    "phone": "+1234567890",
    "address": "123 Main St, City, State",
    "preferences": {
      "style": "casual",
      "colors": ["blue", "black"],
      "sizes": ["M", "L"]
    }
  }'
```

## Outfit Management

### 7. Create Outfit (Admin Only)
```bash
curl -X POST http://localhost:5000/api/outfits \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN" \
  -d '{
    "title": "Summer Floral Dress",
    "description": "Beautiful summer dress perfect for parties",
    "size": "M",
    "type": "dress",
    "category": "women",
    "rentalPrice": 499,
    "tags": ["summer", "floral", "party"],
    "imageUrl": "https://example.com/dress.jpg",
    "brand": "Fashion Brand",
    "color": "Blue",
    "material": "Cotton"
  }'
```

### 8. Get All Outfits (Public)
```bash
curl -X GET "http://localhost:5000/api/outfits?page=1&limit=10&category=women&type=dress"
```

### 9. Get Specific Outfit
```bash
curl -X GET http://localhost:5000/api/outfits/OUTFIT_ID
```

### 10. Update Outfit (Admin Only)
```bash
curl -X PATCH http://localhost:5000/api/outfits/OUTFIT_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN" \
  -d '{
    "title": "Updated Summer Dress",
    "rentalPrice": 599
  }'
```

### 11. Delete Outfit (Admin Only)
```bash
curl -X DELETE http://localhost:5000/api/outfits/OUTFIT_ID \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

## Rental System

### 12. Create Rental Booking
```bash
curl -X POST http://localhost:5000/api/rentals \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "outfitId": "OUTFIT_ID",
    "startDate": "2024-08-01T00:00:00.000Z",
    "endDate": "2024-08-04T00:00:00.000Z",
    "deliveryAddress": {
      "street": "123 Main St",
      "city": "Mumbai",
      "state": "Maharashtra",
      "zipCode": "400001",
      "country": "India"
    },
    "deliveryMethod": "delivery",
    "specialInstructions": "Please handle with care"
  }'
```

### 13. Get Rental Details
```bash
curl -X GET http://localhost:5000/api/rentals/RENTAL_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 14. Get User Rentals
```bash
curl -X GET "http://localhost:5000/api/rentals/user/USER_ID?page=1&limit=10&status=active" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 15. Update Rental Status
```bash
curl -X PATCH http://localhost:5000/api/rentals/RENTAL_ID/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "status": "cancelled",
    "reason": "Change of plans"
  }'
```

### 16. Add Rental Review
```bash
curl -X POST http://localhost:5000/api/rentals/RENTAL_ID/review \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "rating": 5,
    "review": "Great outfit, perfect fit!"
  }'
```

## Swap System

### 17. Create Swap Request
```bash
curl -X POST http://localhost:5000/api/swaps \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "responderId": "RESPONDER_USER_ID",
    "requestorOutfitId": "REQUESTOR_OUTFIT_ID",
    "responderOutfitId": "RESPONDER_OUTFIT_ID",
    "message": "Would love to swap my dress for your jacket!",
    "proposedDuration": 7,
    "exchangeMethod": "meetup"
  }'
```

### 18. Get Swap Details
```bash
curl -X GET http://localhost:5000/api/swaps/SWAP_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 19. Update Swap Status
```bash
curl -X PATCH http://localhost:5000/api/swaps/SWAP_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "status": "accepted",
    "responseMessage": "Sure, let'\''s swap!"
  }'
```

### 20. Get User Swaps
```bash
curl -X GET "http://localhost:5000/api/swaps/user/USER_ID?type=sent&status=pending" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 21. Add Swap Feedback
```bash
curl -X POST http://localhost:5000/api/swaps/SWAP_ID/feedback \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "rating": 4,
    "feedback": "Great swap experience!"
  }'
```

## Sample Test Users

### Normal User
```json
{
  "name": "Alice Smith",
  "email": "alice@example.com",
  "password": "Password123",
  "role": "user"
}
```

### Admin User
```json
{
  "name": "Admin User",
  "email": "admin@closetloop.com",
  "password": "AdminPass123",
  "role": "admin"
}
```

## Testing Flow

1. **Sign up** a normal user and an admin user
2. **Login** to get JWT tokens for both users
3. **Create outfits** using admin token
4. **Browse outfits** (public endpoint)
5. **Create rental booking** using user token
6. **Create swap request** between users
7. **Update statuses** and **add reviews/feedback**

## Error Testing

### Invalid Email Format
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "invalid-email",
    "password": "Password123"
  }'
```

### Weak Password
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "weak"
  }'
```

### Unauthorized Access
```bash
curl -X GET http://localhost:5000/api/auth/me
```

### Invalid Token
```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer invalid_token"
```

## Notes

- Replace `YOUR_JWT_TOKEN`, `USER_ID`, `OUTFIT_ID`, etc. with actual values from your responses
- Admin endpoints require admin role JWT token
- Some endpoints require specific object IDs that you'll get from previous API calls
- All dates should be in ISO 8601 format
- The server should return appropriate HTTP status codes and error messages for validation failures