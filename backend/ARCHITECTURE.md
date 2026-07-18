# GreenCity Backend Architecture

## Overview

This backend follows enterprise-grade architecture patterns with clear separation of concerns, consistent naming conventions, and scalable structure.

## Folder Structure

```
backend/
├── src/
│   ├── config/           # Configuration files
│   │   ├── cloudinary.js
│   │   ├── constants.js
│   │   ├── passport.js
│   │   └── security.js
│   │
│   ├── controllers/      # Request handlers (thin layer)
│   │   ├── authController.js
│   │   ├── baseController.js
│   │   ├── communityController.js
│   │   ├── issueController.js
│   │   ├── issueSolvedController.js
│   │   ├── leaderboardController.js
│   │   ├── organizationController.js
│   │   ├── organizationRankController.js
│   │   ├── pointsController.js
│   │   ├── reportController.js
│   │   ├── routeController.js
│   │   ├── transportController.js
│   │   ├── transportEntryController.js
│   │   ├── transportQueryController.js
│   │   └── userRankController.js
│   │
│   ├── db/              # Database connection
│   │   └── db.js
│   │
│   ├── jobs/            # Background jobs/cron tasks
│   │   └── healthCheck.js
│   │
│   ├── middleware/      # Express middleware
│   │   ├── auth.js
│   │   ├── errorMiddleware.js
│   │   └── upload.js
│   │
│   ├── models/          # Mongoose models (PascalCase)
│   │   ├── EcoRouteHistory.js
│   │   ├── Issue.js
│   │   ├── IssueSolved.js
│   │   ├── Leaderboard.js
│   │   ├── Organization.js
│   │   ├── PointHistory.js
│   │   ├── Post.js
│   │   ├── Transport.js
│   │   ├── TransportEntry.js
│   │   ├── TransportQuery.js
│   │   └── User.js
│   │
│   ├── routes/          # API routes (camelCase with Routes suffix)
│   │   ├── authRoutes.js
│   │   ├── communityRoutes.js
│   │   ├── issueRoutes.js
│   │   ├── issueSolvedRoutes.js
│   │   ├── leaderboardRoutes.js
│   │   ├── oauthRoutes.js
│   │   ├── organizationRankRoutes.js
│   │   ├── organizationRoutes.js
│   │   ├── pointsRoutes.js
│   │   ├── reportRoutes.js
│   │   ├── routeRoutes.js
│   │   ├── transportEntryRoutes.js
│   │   ├── transportQueryRoutes.js
│   │   ├── transportRoutes.js
│   │   ├── userRankRoutes.js
│   │   └── userRoutes.js
│   │
│   ├── services/        # Business logic layer
│   │   ├── aiAnalysis.js
│   │   ├── authService.js
│   │   ├── communityService.js
│   │   ├── emailService.js
│   │   ├── pointsService.js
│   │   ├── reportService.js
│   │   └── routeService.js
│   │
│   ├── tests/           # Test files
│   │   ├── unit/
│   │   └── integration/
│   │
│   ├── uploads/         # Temporary file uploads
│   │
│   ├── utils/           # Utility functions
│   │   ├── asyncHandler.js
│   │   ├── logger.js
│   │   ├── responseFormatter.js
│   │   └── validation.js
│   │
│   ├── validators/      # Request validation schemas
│   │   ├── authValidator.js
│   │   ├── communityValidator.js
│   │   ├── issueValidator.js
│   │   ├── organizationValidator.js
│   │   ├── routeValidator.js
│   │   └── transportValidator.js
│   │
│   ├── app.js           # Express app configuration
│   └── server.js        # Server entry point
│
├── .env                 # Environment variables
├── .env.example         # Environment variables template
├── .gitignore
├── .prettierignore
├── .prettierrc
├── package.json
└── package-lock.json
```

## Architecture Principles

### 1. Separation of Concerns

- **Controllers**: Handle HTTP requests/responses only. Delegate business logic to services.
- **Services**: Contain business logic. Reusable across different controllers.
- **Models**: Define data structure and database interactions.
- **Routes**: Define API endpoints and middleware chain.
- **Validators**: Validate incoming request data before processing.
- **Middleware**: Cross-cutting concerns (auth, error handling, uploads).

### 2. Naming Conventions

- **Files**: camelCase for routes, controllers, services; PascalCase for models
- **Routes**: End with `Routes.js` suffix (e.g., `authRoutes.js`)
- **Controllers**: End with `Controller.js` suffix (e.g., `authController.js`)
- **Models**: PascalCase (e.g., `User.js`, `Issue.js`)
- **Services**: camelCase (e.g., `authService.js`)
- **Validators**: End with `Validator.js` suffix (e.g., `authValidator.js`)

### 3. Layered Architecture

```
Request → Route → Validator → Middleware → Controller → Service → Model → Database
```

### 4. Error Handling

- Use `ApiError` class for custom errors
- Centralized error handling in `errorMiddleware.js`
- Consistent error response format
- Proper HTTP status codes

### 5. Response Format

**Success Response:**
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Error message",
  "errors": [ ... ],
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Best Practices

### Controllers

- Keep controllers thin - delegate business logic to services
- Use `BaseController` for common functionality
- Return consistent response format
- Handle validation errors gracefully

Example:
```javascript
import BaseController from './baseController.js';
import authService from '../services/authService.js';

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    return BaseController.sendSuccess(res, result, 'Login successful');
  } catch (error) {
    return BaseController.sendError(res, error.message, error.statusCode);
  }
};
```

### Services

- Contain all business logic
- Be stateless and reusable
- Use models for database operations
- Throw `ApiError` for expected errors

Example:
```javascript
import User from '../models/User.js';
import { ApiError } from '../middleware/errorMiddleware.js';

export const login = async (email, password) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(401, 'Invalid credentials');
  }
  // Business logic here
  return { token, user };
};
```

### Validators

- Use express-validator for validation
- Define validation rules in separate files
- Include descriptive error messages
- Validate at the route level

Example:
```javascript
import { body } from 'express-validator';

export const validateLogin = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Invalid email format'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];
```

### Routes

- Group related routes together
- Apply middleware at appropriate levels
- Use descriptive route names
- Keep route definitions simple

Example:
```javascript
import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { validateLogin } from '../validators/authValidator.js';
import { login } from '../controllers/authController.js';

const router = express.Router();

router.post('/login', validateLogin, login);
router.get('/profile', authenticate, getProfile);

export default router;
```

## Security

- Helmet for security headers
- Rate limiting for API endpoints
- Input sanitization
- MongoDB injection prevention
- CORS configuration
- JWT authentication
- Password hashing with bcrypt

## Environment Variables

Required environment variables (see `.env.example`):

```env
NODE_ENV=development
PORT=5000
HOST=0.0.0.0

# Database
MONGODB_URI=mongodb://localhost:27017/greencity

# JWT
JWT_SECRET=your-jwt-secret
JWT_EXPIRE=7d

# Session
SESSION_SECRET=your-session-secret

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email
EMAIL_PASS=your-password

# OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret

# AI
GEMINI_API_KEY=your-gemini-api-key
```

## Running the Application

### Development
```bash
npm run dev
```

### Production
```bash
npm start
```

### Install Dependencies
```bash
npm install
```

## API Documentation

API endpoints follow RESTful conventions:

- `GET /api/resource` - List resources
- `GET /api/resource/:id` - Get single resource
- `POST /api/resource` - Create resource
- `PUT /api/resource/:id` - Update resource
- `PATCH /api/resource/:id` - Partial update
- `DELETE /api/resource/:id` - Delete resource

## Testing

Test structure:
- `tests/unit/` - Unit tests for individual functions
- `tests/integration/` - Integration tests for API endpoints

## Contributing

When adding new features:

1. Create model in `models/` (PascalCase)
2. Create service in `services/` (camelCase)
3. Create controller in `controllers/` (camelCase + Controller suffix)
4. Create validator in `validators/` (camelCase + Validator suffix)
5. Create routes in `routes/` (camelCase + Routes suffix)
6. Update `app.js` to include new routes
7. Add tests in `tests/`
8. Update this documentation

## Maintenance

- Regular dependency updates
- Security audits
- Code reviews
- Performance monitoring
- Error log analysis
