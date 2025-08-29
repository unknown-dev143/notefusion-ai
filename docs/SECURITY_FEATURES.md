# NoteFusion AI Security Features

## Overview
This document outlines the security features implemented in the NoteFusion AI application, including rate limiting, content moderation, and security headers.

## Security Features

### 1. Rate Limiting
- **Purpose**: Prevent abuse and ensure fair usage
- **Tiers**:
  - Free: 30 requests/minute
  - Basic: 100 requests/minute
  - Pro: 1000 requests/minute
- **Headers**:
  - `X-RateLimit-Limit`: Maximum requests allowed
  - `X-RateLimit-Remaining`: Remaining requests in the window
  - `X-RateLimit-Reset`: Time when the limit resets
  - `Retry-After`: Time to wait after being rate limited

### 2. Content Moderation
- **Categories**:
  - Hate speech
  - Violence
  - Self-harm
  - Harassment
- **Response**: Returns `400 Bad Request` with violation details

### 3. Security Headers
- `Content-Security-Policy`: Restricts resource loading
- `X-Content-Type-Options`: Prevents MIME type sniffing
- `X-Frame-Options`: Prevents clickjacking
- `X-XSS-Protection`: Enables XSS filtering
- `Referrer-Policy`: Controls referrer information
- `Permissions-Policy`: Controls browser features

## Environment Variables

### Required
```env
# Security
SECRET_KEY=your-secret-key
JWT_SECRET_KEY=your-jwt-secret
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# Rate Limiting
AI_ENABLE_RATE_LIMITING=true
AI_RATE_LIMIT=60/minute
AI_RATE_LIMIT_FREE=30/minute
AI_RATE_LIMIT_BASIC=100/minute
AI_RATE_LIMIT_PRO=1000/minute

# Content Moderation
AI_ENABLE_CONTENT_MODERATION=true
MODERATION_STRICTNESS=medium
MAX_INPUT_LENGTH=10000
```

## Monitoring

### Logging
- All security events are logged with level `WARNING` or higher
- Log format: `[timestamp] [level] [module] message`

### Alerts
Set up alerts for:
- Rate limit breaches
- Content moderation violations
- Failed authentication attempts
- Security-related errors

## API Documentation Updates

### Rate Limited Endpoints
All endpoints under `/api/v1/ai/` are rate limited. Include these headers in your API documentation:

```http
X-RateLimit-Limit: 30
X-RateLimit-Remaining: 29
X-RateLimit-Reset: 1630000000
Retry-After: 60
```

### Error Responses

#### Rate Limit Exceeded
```json
{
  "error": "rate_limit_exceeded",
  "message": "Too many requests. Please try again later.",
  "retry_after": 60,
  "limit": 30,
  "window": "60s"
}
```

#### Content Violation
```json
{
  "error": "content_violation",
  "category": "violence",
  "message": "Content violates our usage policies"
}
```

## Best Practices
1. Always use HTTPS in production
2. Rotate `SECRET_KEY` and `JWT_SECRET_KEY` regularly
3. Monitor security logs for suspicious activity
4. Keep dependencies updated
5. Regularly review and update moderation patterns
