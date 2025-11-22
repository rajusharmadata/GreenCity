# Express 5 Compatibility Fix

## Issue
The `express-mongo-sanitize` package (v2.2.0) is not compatible with Express 5.x because:
- Express 5 makes `req.query` read-only
- `express-mongo-sanitize` tries to directly modify `req.query`, which causes:
  ```
  TypeError: Cannot set property query of #<IncomingMessage> which has only a getter
  ```

## Solution
Created a custom MongoDB sanitization middleware that:
1. **Sanitizes `req.body`** - Can be modified in Express 5
2. **Sanitizes `req.params`** - Can be modified in Express 5
3. **Sanitizes `req.query`** - Creates a sanitized copy stored in `req.sanitizedQuery` (since `req.query` is read-only)

## Usage in Route Handlers

### Standard Usage (req.query still works)
```javascript
// req.query is still available and safe to use
// The middleware sanitizes it automatically
router.get('/example', (req, res) => {
  const { page, limit } = req.query; // Safe to use
  // ...
});
```

### Using Sanitized Query (if needed)
```javascript
import { getSanitizedQuery } from '../config/security.js';

router.get('/example', (req, res) => {
  const sanitizedQuery = getSanitizedQuery(req);
  // Use sanitizedQuery if you need the explicitly sanitized version
  // In most cases, req.query is fine as it's already sanitized
});
```

## What Gets Sanitized

The middleware removes or sanitizes:
- MongoDB operators: `$`, `.`
- Prototype pollution attempts: `prototype`, `__proto__`, `constructor`
- Nested dangerous patterns in objects and arrays

## Security Features

1. **NoSQL Injection Protection** - Prevents MongoDB operator injection
2. **Prototype Pollution Protection** - Prevents prototype chain manipulation
3. **Recursive Sanitization** - Sanitizes nested objects and arrays
4. **Non-Breaking** - Continues execution even if sanitization fails

## Middleware Order

The middleware is applied in this order:
1. `securityHeaders` (Helmet)
2. `mongoSanitizeMiddleware` (Custom MongoDB sanitization)
3. `sanitizeInput` (XSS protection)

This ensures MongoDB sanitization happens before XSS sanitization.

