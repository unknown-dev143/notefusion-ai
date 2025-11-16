# API Key Authentication System

This document provides an overview of the API key authentication system implemented in the NoteFusion AI backend.

## Table of Contents
- [Overview](#overview)
- [Database Schema](#database-schema)
- [Authentication Flow](#authentication-flow)
- [Rate Limiting](#rate-limiting)
- [Security Considerations](#security-considerations)
- [Usage Examples](#usage-examples)
- [Monitoring and Logging](#monitoring-and-logging)

## Overview

The API key authentication system provides a secure way to authenticate API requests using API keys. Each API key is associated with a user and can have specific permissions (scopes) and rate limits.

## Database Schema

The following tables are used for API key management:

### `api_keys`
Stores API key information including the key ID, hashed secret, and metadata.

- `id`: Primary key
- `key_id`: Public part of the API key (first part)
- `hashed_secret`: Hashed secret part of the API key
- `name`: User-defined name for the key
- `user_id`: Foreign key to the users table
- `scopes`: JSON array of permission scopes
- `rate_limit`: Maximum requests per minute
- `is_active`: Whether the key is active
- `created_at`: When the key was created
- `last_used_at`: When the key was last used
- `expires_at`: When the key expires (optional)

### `api_key_usages`
Tracks API key usage for monitoring and analytics.

- `id`: Primary key
- `api_key_id`: Foreign key to api_keys
- `endpoint`: The API endpoint that was accessed
- `method`: HTTP method (GET, POST, etc.)
- `status_code`: HTTP status code of the response
- `timestamp`: When the request was made
- `response_time_ms`: How long the request took to process

### `rate_limit_windows`
Tracks rate limiting information for each API key.

- `id`: Primary key
- `api_key_id`: Foreign key to api_keys
- `window_start`: Start of the rate limit window
- `request_count`: Number of requests in this window
- `window_size_seconds`: Size of the rate limit window in seconds

## Authentication Flow

1. **Client Request**: Client sends a request with the `X-API-Key` header
2. **Key Validation**: Server validates the API key format and checks if it exists
3. **Key Verification**: Server verifies the key secret using secure hashing
4. **Expiration Check**: Server checks if the key has expired
5. **Rate Limiting**: Server checks if the rate limit has been exceeded
6. **Request Processing**: If all checks pass, the request is processed
7. **Usage Logging**: The API key usage is logged for monitoring

## Rate Limiting

Rate limiting is implemented using Redis with the following configuration:

- Default rate limit: 1000 requests per minute (configurable per key)
- Rate limit headers are included in responses:
  - `X-RateLimit-Limit`: Maximum requests allowed in the window
  - `X-RateLimit-Remaining`: Remaining requests in the current window
  - `X-RateLimit-Reset`: Unix timestamp when the window resets

## Security Considerations

1. **Key Storage**: Only hashed versions of API key secrets are stored in the database
2. **Key Transmission**: API keys should only be transmitted over HTTPS
3. **Key Rotation**: API keys should be rotated periodically
4. **Scope Limitation**: Keys should be granted the minimum required permissions
5. **Expiration**: Keys should have a reasonable expiration time

## Usage Examples

### Creating an API Key

```http
POST /api/v1/api-keys/
Authorization: Bearer <user_jwt_token>
Content-Type: application/json

{
  "name": "My API Key",
  "scopes": ["notes:read", "notes:write"],
  "rate_limit": 1000,
  "expires_in_days": 30
}
```

### Making an Authenticated Request

```http
GET /api/v1/notes/
X-API-Key: nf_12345678.abcdef1234567890...
```

### Checking Rate Limit Status

```http
GET /api/v1/api-keys/{key_id}/rate-limit
Authorization: Bearer <user_jwt_token>
```

## Monitoring and Logging

API key usage is logged to:

1. **Database**: Detailed usage statistics in `api_key_usages`
2. **Application Logs**: Authentication and rate limiting events
3. **Monitoring System**: Metrics for API key usage and rate limiting

## Troubleshooting

### Common Issues

1. **Invalid API Key**
   - Verify the API key format (should be `key_id.secret`)
   - Check if the key exists and is active
   - Verify the key hasn't expired

2. **Rate Limit Exceeded**
   - Check the `X-RateLimit-*` headers
   - Wait for the rate limit window to reset
   - Consider increasing the rate limit if needed

3. **Permission Denied**
   - Verify the key has the required scopes
   - Check if the key is still active

## Deployment Notes

1. **Redis Configuration**: Ensure Redis is properly configured for rate limiting
2. **Key Rotation**: Implement a process for regular key rotation
3. **Monitoring**: Set up alerts for suspicious activity
4. **Backup**: Regularly back up the API key database
