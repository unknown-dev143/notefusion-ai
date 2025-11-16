# API Key Authentication

This document provides a comprehensive guide on how to use API key authentication with the NoteFusion AI API.

## Table of Contents
- [Overview](#overview)
- [Generating API Keys](#generating-api-keys)
- [Using API Keys](#using-api-keys)
- [Rate Limiting](#rate-limiting)
- [Scopes and Permissions](#scopes-and-permissions)
- [Error Handling](#error-handling)
- [Security Best Practices](#security-best-practices)

## Overview

API keys provide a way to authenticate and authorize access to the NoteFusion AI API. Each API key is associated with a user account and can have specific permissions (scopes) and rate limits.

## Generating API Keys

### Via the API

1. **Authenticate** with your user credentials to get an access token:
   ```http
   POST /api/v1/auth/login/access-token
   Content-Type: application/x-www-form-urlencoded
   
   username=user@example.com&password=yourpassword
   ```

2. **Create a new API key**:
   ```http
   POST /api/v1/api-keys/
   Authorization: Bearer YOUR_ACCESS_TOKEN
   Content-Type: application/json
   
   {
     "name": "My API Key",
     "scopes": ["notes:read", "notes:write"],
     "rate_limit": 1000,
     "expires_in_days": 30
   }
   ```

3. **Save the response** which includes your API key. The full key will only be shown once:
   ```json
   {
     "success": true,
     "message": "API key created successfully",
     "data": {
       "id": "550e8400-e29b-41d4-a716-446655440000",
       "name": "My API Key",
       "key_id": "nf_12345678",
       "key": "nf_12345678.abcdef1234567890...",
       "scopes": ["notes:read", "notes:write"],
       "rate_limit": 1000,
       "is_active": true,
       "created_at": "2025-08-28T15:00:00Z",
       "expires_at": "2025-09-27T15:00:00Z"
     }
   }
   ```

## Using API Keys

Include the API key in the `Authorization` header of your requests:

```http
GET /api/v1/notes/
Authorization: Bearer nf_12345678.abcdef1234567890...
```

## Rate Limiting

Each API key has a rate limit (default: 1000 requests per minute). The following headers are included in responses:

- `X-RateLimit-Limit`: Maximum requests allowed in the time window
- `X-RateLimit-Remaining`: Remaining requests in the current window
- `X-RateLimit-Reset`: Unix timestamp when the current window resets

When the rate limit is exceeded, a `429 Too Many Requests` response is returned with a `Retry-After` header.

## Scopes and Permissions

API keys can be restricted to specific scopes. Available scopes:

- `notes:read`: Read access to notes
- `notes:write`: Create and update notes
- `notes:delete`: Delete notes
- `api_keys:read`: View API keys
- `api_keys:write`: Create and update API keys
- `api_keys:delete`: Delete API keys

## Error Handling

### Common Error Responses

| Status Code | Error Code | Description |
|-------------|------------|-------------|
| 400 | invalid_request | Invalid request data |
| 401 | unauthorized | Invalid or missing authentication |
| 403 | forbidden | Insufficient permissions |
| 404 | not_found | Resource not found |
| 429 | rate_limit_exceeded | Rate limit exceeded |
| 500 | server_error | Internal server error |

Example error response:

```json
{
  "success": false,
  "error": "Rate limit exceeded",
  "code": "rate_limit_exceeded",
  "details": {
    "retry_after": 30
  }
}
```

## Security Best Practices

1. **Keep your API keys secret** - Treat them like passwords
2. **Use the principle of least privilege** - Only request necessary scopes
3. **Rotate keys regularly** - Create new keys and delete old ones periodically
4. **Set appropriate rate limits** - Higher limits for server-to-server communication
5. **Use environment variables** - Don't hardcode API keys in your code
6. **Monitor usage** - Regularly check the usage of your API keys

## Managing API Keys

### List all API keys
```http
GET /api/v1/api-keys/
Authorization: Bearer YOUR_ACCESS_TOKEN
```

### Get API key details
```http
GET /api/v1/api-keys/{key_id}
Authorization: Bearer YOUR_ACCESS_TOKEN
```

### Update an API key
```http
PATCH /api/v1/api-keys/{key_id}
Authorization: Bearer YOUR_ACCESS_TOKEN
Content-Type: application/json

{
  "name": "Updated Key Name",
  "is_active": true
}
```

### Delete an API key
```http
DELETE /api/v1/api-keys/{key_id}
Authorization: Bearer YOUR_ACCESS_TOKEN
```

### Get API key usage statistics
```http
GET /api/v1/api-keys/{key_id}/usage
Authorization: Bearer YOUR_ACCESS_TOKEN
```

### Get rate limit information
```http
GET /api/v1/api-keys/{key_id}/rate-limit
Authorization: Bearer YOUR_ACCESS_TOKEN
```
