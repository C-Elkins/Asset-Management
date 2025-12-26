# API Documentation

Base path: The Spring Boot app serves under context path `/api/v1`.

Examples:

- GET /api/v1/assets
- POST /api/v1/assets
- GET /api/v1/users
- GET /api/v1/dashboard/stats

## Privacy Endpoints

- GET /api/v1/privacy/policy-status — compliance status summary
- GET /api/v1/privacy/consent — current user consent (or default if none)
- PUT /api/v1/privacy/consent — update user consent
- GET /api/v1/privacy/my-data — user profile + consent snapshot
- POST /api/v1/privacy/request-deletion — submit deletion request
