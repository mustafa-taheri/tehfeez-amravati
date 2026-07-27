# Quran Tehfeez Management System

## REST API Documentation

Version: 1.0

Architecture: REST API

Protocol: HTTPS

Authentication: JWT (Access + Refresh Token)

Data Format: JSON

Application: React Native

Backend: Node.js + Express + Prisma

Database: PostgreSQL

---

# 1. API Overview

## Purpose

This document defines the REST APIs exposed by the Quran Tehfeez Management System backend.

It acts as the contract between:

- React Native Mobile Application
- Node.js Backend
- PostgreSQL Database

Every API described in this document is implementation-ready and maps directly to the business entities defined in:

- 01-Requirements.md
- 02-Database-Schema.md

---

## API Design Principles

The API follows these principles:

- RESTful Resource Design
- Stateless Communication
- JWT Authentication
- Consistent Request Structure
- Consistent Response Structure
- Predictable HTTP Status Codes
- Role-Based Authorization
- Validation Before Processing
- Audit-Friendly Operations
- Versioned Endpoints

---

## REST Resource Naming

Resources use plural nouns.

Examples

/api/v1/students

/api/v1/users

/api/v1/quran-sessions

/api/v1/student-attendance

/api/v1/student-fee-collections

/api/v1/monthly-settlements

Actions that cannot be represented as CRUD operations use explicit action endpoints.

Examples

POST /api/v1/monthly-settlements/generate

POST /api/v1/monthly-settlements/{id}/lock

POST /api/v1/student-fee-collections/generate

---

# 2. Base URL

## Development

https://localhost:5000/api/v1

---

## Staging

https://staging-api.qurantehfeez.com/api/v1

---

## Production

https://api.qurantehfeez.com/api/v1

---

## Versioning Strategy

Every endpoint begins with:

/api/v1/

Future breaking changes shall be introduced using:

/api/v2/

Older versions remain supported during migration periods.

---

# 3. Authentication Standards

The system uses JWT-based authentication.

Every authenticated request must include a valid Access Token.

Refresh Tokens are used to obtain new Access Tokens without requiring the user to log in again.

---

## Public Endpoints

No authentication required.

Examples

POST /auth/login

POST /auth/refresh-token

---

## Protected Endpoints

Authentication required.

Authorization:

Bearer <access_token>

Example

Authorization: Bearer eyJhbGciOiJIUzI1NiIs...

---

## Authorization Rules

| Role   | Permissions                                            |
| ------ | ------------------------------------------------------ |
| ADMIN  | Full system access                                     |
| HUFFAZ | Academic operations, own profile, assigned permissions |

Authorization is enforced at the API layer before business logic execution.

---

# 4. HTTP Methods

The API follows standard REST conventions.

| Method  | Purpose              |
| ------- | -------------------- |
| GET     | Retrieve resource(s) |
| POST    | Create resource      |
| PUT     | Full update          |
| PATCH   | Partial update       |
| DELETE  | Soft delete          |
| OPTIONS | CORS preflight       |

DELETE requests perform soft deletes only.

No operational record is physically deleted.

---

# 5. Request Standards

## Headers

Every JSON request shall include:

```http
Content-Type: application/json
Accept: application/json
```

Authenticated requests additionally require:

```http
Authorization: Bearer <access_token>
```

---

## Path Parameters

Example

```http
GET /students/{studentId}
```

Example Value

```text
/student/3cb8f554-4d42-4d73-a69e-a2e1a45d7f98
```

---

## Query Parameters

Used for:

- Filtering
- Searching
- Pagination
- Sorting

Example

```http
GET /students?page=1&pageSize=20&search=Ali&status=ACTIVE
```

---

## Request Body

All request bodies use JSON.

Example

```json
{
  "firstName": "Ali",
  "lastName": "Burhani",
  "currentMarhalaId": "uuid",
  "parentMobileNumber": "9876543210"
}
```

---

# 6. Response Standards

Every endpoint follows a consistent response structure.

---

## Success Response

```json
{
  "success": true,
  "message": "Operation completed successfully.",
  "data": {},
  "meta": {
    "requestId": "req_01HXABC123",
    "timestamp": "2026-07-27T10:30:15Z"
  }
}
```

---

## Paginated Response

```json
{
  "success": true,
  "message": "Students retrieved successfully.",
  "data": [],
  "meta": {
    "page": 1,
    "pageSize": 20,
    "totalRecords": 156,
    "totalPages": 8,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
```

---

## Validation Error Response

```json
{
  "success": false,
  "message": "Validation failed.",
  "errors": [
    {
      "field": "firstName",
      "message": "First Name is required."
    },
    {
      "field": "parentMobileNumber",
      "message": "Invalid mobile number."
    }
  ]
}
```

---

## Business Error Response

```json
{
  "success": false,
  "message": "Monthly settlement has already been locked.",
  "code": "SETTLEMENT_LOCKED"
}
```

---

# 7. HTTP Status Codes

| Status Code | Meaning                    |
| ----------- | -------------------------- |
| 200         | Success                    |
| 201         | Resource Created           |
| 204         | No Content                 |
| 400         | Validation Error           |
| 401         | Authentication Failed      |
| 403         | Access Denied              |
| 404         | Resource Not Found         |
| 409         | Business Rule Conflict     |
| 422         | Invalid Business Operation |
| 500         | Internal Server Error      |

---

# 8. Error Handling Standards

All errors follow a standard structure.

```json
{
  "success": false,
  "message": "Operation failed.",
  "code": "VALIDATION_ERROR",
  "errors": [
    {
      "field": "fieldName",
      "message": "Validation message"
    }
  ]
}
```

---

## Common Error Codes

| Code                    | Description                       |
| ----------------------- | --------------------------------- |
| VALIDATION_ERROR        | Input validation failed           |
| INVALID_CREDENTIALS     | Incorrect username or password    |
| TOKEN_EXPIRED           | Access token expired              |
| ACCESS_DENIED           | User lacks required permission    |
| RESOURCE_NOT_FOUND      | Requested entity not found        |
| DUPLICATE_RECORD        | Duplicate unique value            |
| SETTLEMENT_LOCKED       | Academic month is locked          |
| BUSINESS_RULE_VIOLATION | Business rule prevented operation |
| INTERNAL_SERVER_ERROR   | Unexpected server error           |

---

# 9. Pagination Standards

List APIs support pagination.

Default values:

```text
page=1

pageSize=20
```

Maximum page size:

```text
100
```

Standard query parameters:

```text
?page=

&pageSize=

&search=

&sortBy=

&sortOrder=
```

Sort Order values:

- asc
- desc

---

# 10. Filtering Standards

Endpoints may support filtering.

Examples

Students

```text
status

marhalaId

search
```

Attendance

```text
attendanceDate

attendanceStatus

academicMonthId
```

Quran Sessions

```text
studentId

userId

sessionDate

sessionType
```

Fee Collection

```text
paymentStatus

academicMonthId
```

Settlement

```text
settlementStatus

academicMonthId
```

---

# 11. Date & Time Standards

Business Dates

Format

```text
YYYY-MM-DD
```

Example

```text
2026-07-27
```

---

Timestamps

ISO-8601 UTC

Example

```text
2026-07-27T10:30:15Z
```

The backend stores timestamps in UTC.

The mobile application is responsible for converting them to the device's local timezone.

---

# 12. Security Standards

Authentication

JWT Access Token

JWT Refresh Token

---

Authorization

Role-Based Access Control (RBAC)

Roles

- ADMIN
- HUFFAZ

---

Passwords

- BCrypt hashing
- Never returned by any API
- Never logged

---

Sensitive Data

Sensitive fields such as:

- passwordHash
- refreshToken
- internal audit fields (where not applicable)

must never be exposed in public API responses.

---

# 13. API Versioning

Current Version

```text
/api/v1/
```

Rules

- Breaking changes require a new API version.
- Non-breaking additions may be introduced within the current version.
- Deprecated endpoints should remain available until all clients migrate.

Example

```text
/api/v1/students

/api/v2/students
```

---

# 14. API Documentation Standards

Each endpoint in this document follows the same structure.

Every endpoint includes:

- Purpose
- Endpoint
- HTTP Method
- Authorization
- Request Headers
- Path Parameters
- Query Parameters
- Request Body
- Validation Rules
- Business Rules
- Success Response
- Error Responses
- Notes

This standardized format ensures consistency across all modules and simplifies implementation, testing, and future OpenAPI/Swagger generation.

---

# 2. Authentication APIs

The Authentication module is responsible for:

- User Login
- Access Token Generation
- Refresh Token Management
- Logout
- Password Management
- Current User Profile

Authentication is based on JWT using:

- Access Token
- Refresh Token

Supported Roles:

- ADMIN
- HUFFAZ

Students do not authenticate in Phase 1.

---

# 2.1 Login

## Endpoint

POST /api/v1/auth/login

---

## Purpose

Authenticates a user using username and password.

If authentication succeeds, the API returns:

- User Profile
- Access Token
- Refresh Token
- Token Expiry Information

---

## Authorization

Public

---

## Request Headers

```http
Content-Type: application/json
Accept: application/json
```

---

## Request Body

```json
{
  "username": "admin",
  "password": "Password@123"
}
```

---

## Validation Rules

username

- Required
- 3–100 characters

password

- Required

---

## Business Rules

- User must exist.
- User must be active.
- Password must match the stored BCrypt hash.
- Access Token shall be generated.
- Refresh Token shall be generated.
- User's lastLoginAt shall be updated.
- Password hash shall never be returned.

---

## Success Response

HTTP 200

```json
{
  "success": true,
  "message": "Login successful.",
  "data": {
    "user": {
      "id": "uuid",
      "firstName": "Admin",
      "lastName": "User",
      "fullName": "Admin User",
      "username": "admin",
      "role": "ADMIN",
      "profileImage": null
    },
    "tokens": {
      "accessToken": "jwt_access_token",
      "refreshToken": "jwt_refresh_token",
      "expiresIn": 3600
    }
  }
}
```

---

## Error Responses

400

Validation failed.

401

Invalid username or password.

403

User account is inactive.

500

Internal server error.

---

# 2.2 Refresh Token

## Endpoint

POST /api/v1/auth/refresh-token

---

## Purpose

Generates a new Access Token using a valid Refresh Token.

---

## Authorization

Public

Refresh Token required.

---

## Request Headers

```http
Content-Type: application/json
```

---

## Request Body

```json
{
  "refreshToken": "jwt_refresh_token"
}
```

---

## Validation Rules

refreshToken

- Required

---

## Business Rules

- Refresh Token must exist.
- Refresh Token must not be expired.
- Refresh Token must belong to an active user.
- Old Access Token is not required.
- A new Access Token shall be generated.
- Refresh Token rotation may be implemented.

---

## Success Response

HTTP 200

```json
{
  "success": true,
  "message": "Access token refreshed successfully.",
  "data": {
    "accessToken": "new_access_token",
    "expiresIn": 3600
  }
}
```

---

## Error Responses

401

Invalid Refresh Token.

401

Expired Refresh Token.

403

Inactive user.

500

Internal server error.

---

# 2.3 Logout

## Endpoint

POST /api/v1/auth/logout

---

## Purpose

Logs out the authenticated user.

The Refresh Token is invalidated.

---

## Authorization

Bearer Token Required

---

## Request Headers

```http
Authorization: Bearer <access_token>
```

---

## Request Body

```json
{
  "refreshToken": "jwt_refresh_token"
}
```

---

## Business Rules

- User must be authenticated.
- Refresh Token shall be revoked.
- Mobile application shall remove locally stored tokens.

---

## Success Response

HTTP 200

```json
{
  "success": true,
  "message": "Logout successful."
}
```

---

## Error Responses

401

Unauthorized.

500

Internal server error.

---

# 2.4 Change Password

## Endpoint

POST /api/v1/auth/change-password

---

## Purpose

Allows an authenticated user to change their password.

---

## Authorization

Bearer Token Required

---

## Request Headers

```http
Authorization: Bearer <access_token>
```

---

## Request Body

```json
{
  "currentPassword": "OldPassword@123",
  "newPassword": "NewPassword@123",
  "confirmPassword": "NewPassword@123"
}
```

---

## Validation Rules

currentPassword

- Required

newPassword

- Required
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one digit
- At least one special character

confirmPassword

- Required
- Must match newPassword

---

## Business Rules

- Current password must match.
- New password cannot equal current password.
- Password shall be stored using BCrypt.
- Existing Refresh Tokens may be revoked after password change.
- User must log in again if Refresh Tokens are revoked.

---

## Success Response

HTTP 200

```json
{
  "success": true,
  "message": "Password changed successfully."
}
```

---

## Error Responses

400

Validation failed.

401

Current password incorrect.

409

New password matches current password.

500

Internal server error.

---

# 2.5 My Profile

## Endpoint

GET /api/v1/auth/me

---

## Purpose

Returns the authenticated user's profile.

Used by the mobile application after login and app startup.

---

## Authorization

Bearer Token Required

---

## Request Headers

```http
Authorization: Bearer <access_token>
```

---

## Request Body

None

---

## Business Rules

- User must be authenticated.
- Only the authenticated user's profile is returned.
- Sensitive information must never be returned.

---

## Success Response

HTTP 200

```json
{
  "success": true,
  "message": "Profile retrieved successfully.",
  "data": {
    "id": "uuid",
    "firstName": "Admin",
    "lastName": "User",
    "fullName": "Admin User",
    "username": "admin",
    "mobileNumber": "9876543210",
    "email": "admin@example.com",
    "role": "ADMIN",
    "profileImage": null,
    "lastLoginAt": "2026-07-27T10:30:15Z"
  }
}
```

---

## Error Responses

401

Unauthorized.

403

Inactive user.

404

User not found.

500

Internal server error.

---

# Authentication Flow

```text
User Opens App

↓

Splash Screen

↓

Access Token Available?

↓

YES ------------------------ NO

↓                           ↓

Validate Token          Login Screen

↓                           ↓

Valid?                  Enter Credentials

↓                           ↓

YES ---- NO                Login API

↓         ↓                   ↓

Dashboard  Refresh Token      JWT Issued

↓         ↓                   ↓

Success?                    Store Tokens

↓         ↓                   ↓

YES      Login Screen      Dashboard

↓

Continue Session
```

---

# Authentication Security Rules

- Passwords shall be stored using BCrypt hashing.
- Password hashes shall never be returned by any API.
- Every authenticated request requires a valid Access Token.
- Refresh Tokens are used to obtain new Access Tokens.
- Users with `isActive = false` shall not be allowed to authenticate.
- Authentication failures shall return generic error messages to avoid revealing whether a username exists.
- All authentication endpoints must be served over HTTPS in staging and production.

---

# Mobile Application Storage

The mobile application should securely store:

- Access Token
- Refresh Token
- User Profile

The application should never store:

- Password
- Password Hash

---

# 3. User Management APIs

The User Management module allows the Admin to manage authenticated users.

In Phase 1, only two user roles exist:

- ADMIN
- HUFFAZ

The User entity serves as the master record for authentication, authorization, and Huffaz profile management.

Only users with the ADMIN role can access these APIs.

---

# 3.1 Create User (Huffaz)

## Endpoint

POST /api/v1/users

---

## Purpose

Creates a new Huffaz account.

The created user can immediately log in using the assigned username and password.

---

## Authorization

Bearer Token Required

Role Required

ADMIN

---

## Request Headers

```http
Authorization: Bearer <access_token>
Content-Type: application/json
```

---

## Request Body

```json
{
  "firstName": "Mohammed",
  "lastName": "Ali",
  "username": "mohammed.ali",
  "mobileNumber": "9876543210",
  "email": "mohammed@example.com",
  "password": "Password@123",
  "confirmPassword": "Password@123",
  "role": "HUFFAZ",
  "profileImage": null
}
```

---

## Validation Rules

firstName

- Required
- Maximum 100 characters

lastName

- Optional
- Maximum 100 characters

username

- Required
- Unique
- 3–100 characters

mobileNumber

- Required
- Unique
- Valid mobile format

email

- Optional
- Valid email format
- Unique if provided

password

- Required
- Minimum 8 characters
- One uppercase letter
- One lowercase letter
- One number
- One special character

confirmPassword

- Must match password

role

- Required
- Allowed values:
  - HUFFAZ

---

## Business Rules

- Only Admin can create users.
- Phase 1 allows creation of Huffaz accounts only.
- Username must be unique.
- Mobile Number must be unique.
- Password shall be stored using BCrypt hashing.
- Newly created users are Active by default.
- Audit fields shall be populated automatically.

---

## Success Response

HTTP 201

```json
{
  "success": true,
  "message": "User created successfully.",
  "data": {
    "id": "uuid",
    "firstName": "Mohammed",
    "lastName": "Ali",
    "fullName": "Mohammed Ali",
    "username": "mohammed.ali",
    "mobileNumber": "9876543210",
    "email": "mohammed@example.com",
    "role": "HUFFAZ",
    "isActive": true,
    "createdAt": "2026-07-27T10:30:15Z"
  }
}
```

---

## Error Responses

400

Validation failed.

409

Username already exists.

409

Mobile number already exists.

500

Internal server error.

---

# 3.2 Get Users

## Endpoint

GET /api/v1/users

---

## Purpose

Returns a paginated list of users.

Supports searching, filtering, sorting, and pagination.

---

## Authorization

Bearer Token Required

Role Required

ADMIN

---

## Query Parameters

| Parameter | Required | Description                         |
| --------- | -------- | ----------------------------------- |
| page      | No       | Page number                         |
| pageSize  | No       | Records per page                    |
| search    | No       | Search by name, username, or mobile |
| role      | No       | Filter by role                      |
| isActive  | No       | Active/Inactive filter              |
| sortBy    | No       | Sort column                         |
| sortOrder | No       | asc / desc                          |

---

## Example

```http
GET /api/v1/users?page=1&pageSize=20&role=HUFFAZ&search=Ali
```

---

## Business Rules

- Soft deleted users are excluded.
- Password fields are never returned.
- Results are paginated.

---

## Success Response

HTTP 200

```json
{
  "success": true,
  "message": "Users retrieved successfully.",
  "data": [
    {
      "id": "uuid",
      "fullName": "Mohammed Ali",
      "username": "mohammed.ali",
      "mobileNumber": "9876543210",
      "role": "HUFFAZ",
      "isActive": true
    }
  ],
  "meta": {
    "page": 1,
    "pageSize": 20,
    "totalRecords": 8,
    "totalPages": 1
  }
}
```

---

## Error Responses

401

Unauthorized.

403

Access denied.

500

Internal server error.

---

# 3.3 Get User Details

## Endpoint

GET /api/v1/users/{userId}

---

## Purpose

Returns complete details of a specific user.

---

## Authorization

Bearer Token Required

Role Required

ADMIN

---

## Path Parameters

| Parameter | Description |
| --------- | ----------- |
| userId    | User UUID   |

---

## Business Rules

- User must exist.
- Password hash is never returned.
- Soft deleted users are not returned.

---

## Success Response

HTTP 200

```json
{
  "success": true,
  "message": "User retrieved successfully.",
  "data": {
    "id": "uuid",
    "firstName": "Mohammed",
    "lastName": "Ali",
    "fullName": "Mohammed Ali",
    "username": "mohammed.ali",
    "mobileNumber": "9876543210",
    "email": "mohammed@example.com",
    "role": "HUFFAZ",
    "profileImage": null,
    "lastLoginAt": "2026-07-27T10:30:15Z",
    "isActive": true
  }
}
```

---

## Error Responses

404

User not found.

401

Unauthorized.

403

Access denied.

500

Internal server error.

---

# 3.4 Update User

## Endpoint

PUT /api/v1/users/{userId}

---

## Purpose

Updates an existing user's profile.

---

## Authorization

Bearer Token Required

Role Required

ADMIN

---

## Path Parameters

| Parameter | Description |
| --------- | ----------- |
| userId    | User UUID   |

---

## Request Body

```json
{
  "firstName": "Mohammed",
  "lastName": "Burhani",
  "mobileNumber": "9876543210",
  "email": "burhani@example.com",
  "profileImage": "https://example.com/profile.jpg",
  "isActive": true
}
```

---

## Validation Rules

- Mobile Number must remain unique.
- Email must remain unique if provided.
- firstName is required.
- Username cannot be modified.

---

## Business Rules

- Username is immutable.
- Role cannot be changed through this endpoint.
- Password updates must use the Change Password API.
- Audit fields shall be updated automatically.

---

## Success Response

HTTP 200

```json
{
  "success": true,
  "message": "User updated successfully."
}
```

---

## Error Responses

400

Validation failed.

404

User not found.

409

Duplicate mobile number.

500

Internal server error.

---

# 3.5 Delete User

## Endpoint

DELETE /api/v1/users/{userId}

---

## Purpose

Soft deletes a user account.

---

## Authorization

Bearer Token Required

Role Required

ADMIN

---

## Path Parameters

| Parameter | Description |
| --------- | ----------- |
| userId    | User UUID   |

---

## Business Rules

- Physical deletion is not permitted.
- System performs a soft delete.
- User can no longer authenticate.
- Historical attendance, Quran sessions, and settlements remain intact.
- Admin cannot delete their own account.

---

## Success Response

HTTP 200

```json
{
  "success": true,
  "message": "User deleted successfully."
}
```

---

## Error Responses

400

Cannot delete your own account.

404

User not found.

409

User has active dependencies.

500

Internal server error.

---

# User Management Workflow

```text
Admin Login

↓

Open User Management

↓

Create Huffaz

↓

User Receives Credentials

↓

Huffaz Logs In

↓

Admin Updates Profile (Optional)

↓

Deactivate / Soft Delete User (If Required)
```

---

# User Management Security Rules

- Only ADMIN users may access User Management APIs.
- Passwords are never returned by any endpoint.
- Username is immutable after account creation.
- Password changes are handled exclusively through `/api/v1/auth/change-password`.
- Soft deleted users cannot authenticate.
- Every create, update, and delete operation records audit information.

---

# 4. Academic Management APIs

The Academic Management module provides the master data required by the application.

These APIs manage:

- Academic Periods
- Academic Months
- Marhalas
- Marhala Fee Configurations

Academic data changes infrequently and is maintained by the Admin only.

---

# 4.1 Get Academic Periods

## Endpoint

GET /api/v1/academic-periods

---

## Purpose

Returns all Academic Periods.

Used for:

- Academic Period selection
- Reports
- Academic configuration

---

## Authorization

Bearer Token Required

Role Required

ADMIN

---

## Query Parameters

| Parameter | Required | Description           |
| --------- | -------- | --------------------- |
| isCurrent | No       | Filter current period |
| isActive  | No       | Filter active periods |

---

## Business Rules

- Returns Academic Periods sorted by newest first.
- Soft deleted periods are excluded.

---

## Success Response

HTTP 200

```json
{
  "success": true,
  "message": "Academic periods retrieved successfully.",
  "data": [
    {
      "id": "uuid",
      "name": "2026-2027",
      "startDate": "2026-07-01",
      "endDate": "2027-06-30",
      "isCurrent": true,
      "isActive": true
    }
  ]
}
```

---

## Error Responses

401

Unauthorized.

403

Access denied.

500

Internal server error.

---

# 4.2 Get Academic Months

## Endpoint

GET /api/v1/academic-months

---

## Purpose

Returns Academic Months for a selected Academic Period.

---

## Authorization

Bearer Token Required

Role Required

ADMIN

---

## Query Parameters

| Parameter        | Required | Description                |
| ---------------- | -------- | -------------------------- |
| academicPeriodId | Yes      | Academic Period UUID       |
| isCurrent        | No       | Current Month              |
| settlementStatus | No       | DRAFT / GENERATED / LOCKED |

---

## Business Rules

- Academic Months belong to one Academic Period.
- Results are sorted by month number.

---

## Success Response

HTTP 200

```json
{
  "success": true,
  "message": "Academic months retrieved successfully.",
  "data": [
    {
      "id": "uuid",
      "name": "July",
      "monthNumber": 7,
      "year": 2026,
      "workingDays": 26,
      "settlementStatus": "DRAFT",
      "isCurrent": true
    }
  ]
}
```

---

## Error Responses

400

Academic Period is required.

404

Academic Period not found.

500

Internal server error.

---

# 4.3 Get Marhalas

## Endpoint

GET /api/v1/marhalas

---

## Purpose

Returns the master Marhala list.

Used while:

- Creating Students
- Updating Students
- Reporting
- Fee Configuration

---

## Authorization

Bearer Token Required

Roles

- ADMIN
- HUFFAZ

---

## Business Rules

- Only active Marhalas are returned.
- Results are ordered by displayOrder.

---

## Success Response

HTTP 200

```json
{
  "success": true,
  "message": "Marhalas retrieved successfully.",
  "data": [
    {
      "id": "uuid",
      "code": "ULA",
      "name": "Marhala Ula",
      "displayOrder": 1
    },
    {
      "id": "uuid",
      "code": "SANIYAH",
      "name": "Marhala Saniyah",
      "displayOrder": 2
    }
  ]
}
```

---

## Error Responses

401

Unauthorized.

500

Internal server error.

---

# 4.4 Get Marhala Fee Configurations

## Endpoint

GET /api/v1/marhala-fee-configurations

---

## Purpose

Returns the configured monthly fee for every Marhala within an Academic Period.

---

## Authorization

Bearer Token Required

Role Required

ADMIN

---

## Query Parameters

| Parameter        | Required | Description          |
| ---------------- | -------- | -------------------- |
| academicPeriodId | Yes      | Academic Period UUID |

---

## Business Rules

- Fee configuration is versioned by Academic Period.
- Historical configurations remain unchanged.

---

## Success Response

HTTP 200

```json
{
  "success": true,
  "message": "Marhala fee configurations retrieved successfully.",
  "data": [
    {
      "id": "uuid",
      "marhala": "Marhala Ula",
      "monthlyFee": 600.0,
      "effectiveFrom": "2026-07-01",
      "effectiveTo": null
    },
    {
      "id": "uuid",
      "marhala": "Marhala Saniyah",
      "monthlyFee": 800.0,
      "effectiveFrom": "2026-07-01",
      "effectiveTo": null
    }
  ]
}
```

---

## Error Responses

400

Academic Period is required.

404

Configuration not found.

500

Internal server error.

---

# 5. Student Management APIs

The Student Management module maintains the master information for every student.

Only master information is managed here.

Daily attendance, Quran sessions, notes, promotions, and fee collection are handled by dedicated modules.

---

# 5.1 Create Student

## Endpoint

POST /api/v1/students

---

## Purpose

Creates a new student profile.

---

## Authorization

Bearer Token Required

Roles

- ADMIN
- HUFFAZ

---

## Request Body

```json
{
  "itsNumber": "12345678",
  "firstName": "Ali",
  "lastName": "Burhani",
  "fatherName": "Mohammed Burhani",
  "gender": "MALE",
  "dateOfBirth": "2015-05-20",
  "admissionDate": "2026-07-15",
  "mobileNumber": "9876543210",
  "parentMobileNumber": "9876500000",
  "address": "Mumbai",
  "currentMarhalaId": "uuid",
  "remarks": "New Admission"
}
```

---

## Validation Rules

- ITS Number is required and unique.
- First Name is required.
- Parent Mobile Number is required.
- Current Marhala is required.
- Admission Date is required.

---

## Business Rules

- Student is created with ACTIVE status.
- Initial MarhalaHistory record is created automatically.
- Audit fields are populated automatically.

---

## Success Response

HTTP 201

```json
{
  "success": true,
  "message": "Student created successfully.",
  "data": {
    "id": "uuid",
    "itsNumber": "12345678",
    "fullName": "Ali Burhani",
    "status": "ACTIVE"
  }
}
```

---

## Error Responses

400

Validation failed.

409

ITS Number already exists.

500

Internal server error.

---

# 5.2 Get Students

## Endpoint

GET /api/v1/students

---

## Purpose

Returns a paginated list of students.

---

## Authorization

Bearer Token Required

Roles

- ADMIN
- HUFFAZ

---

## Query Parameters

| Parameter | Required | Description       |
| --------- | -------- | ----------------- |
| page      | No       | Page number       |
| pageSize  | No       | Page size         |
| search    | No       | Name / ITS search |
| status    | No       | Student Status    |
| marhalaId | No       | Current Marhala   |
| sortBy    | No       | Sort column       |
| sortOrder | No       | asc / desc        |

---

## Business Rules

- Soft deleted students are excluded.
- Results are paginated.
- Search supports ITS Number and student name.

---

## Success Response

HTTP 200

```json
{
  "success": true,
  "message": "Students retrieved successfully.",
  "data": [
    {
      "id": "uuid",
      "itsNumber": "12345678",
      "fullName": "Ali Burhani",
      "currentMarhala": "Marhala Ula",
      "status": "ACTIVE"
    }
  ],
  "meta": {
    "page": 1,
    "pageSize": 20,
    "totalRecords": 120,
    "totalPages": 6
  }
}
```

---

## Error Responses

401

Unauthorized.

500

Internal server error.

---

# 5.3 Get Student Details

## Endpoint

GET /api/v1/students/{studentId}

---

## Purpose

Returns the complete master profile of a student.

---

## Authorization

Bearer Token Required

Roles

- ADMIN
- HUFFAZ

---

## Path Parameters

| Parameter | Description  |
| --------- | ------------ |
| studentId | Student UUID |

---

## Business Rules

- Returns only the student master profile.
- Attendance, Quran Sessions, Notes, Fee Collection, and Timeline are retrieved through their respective APIs.

---

## Success Response

HTTP 200

```json
{
  "success": true,
  "message": "Student retrieved successfully.",
  "data": {
    "id": "uuid",
    "itsNumber": "12345678",
    "firstName": "Ali",
    "lastName": "Burhani",
    "fatherName": "Mohammed Burhani",
    "currentMarhala": "Marhala Ula",
    "status": "ACTIVE",
    "parentMobileNumber": "9876500000"
  }
}
```

---

## Error Responses

404

Student not found.

500

Internal server error.

---

# 5.4 Update Student

## Endpoint

PUT /api/v1/students/{studentId}

---

## Purpose

Updates student master information.

---

## Authorization

Bearer Token Required

Roles

- ADMIN
- HUFFAZ

---

## Business Rules

- ITS Number cannot be modified.
- Changing the current Marhala automatically creates a MarhalaHistory record.
- Historical records remain unchanged.
- Audit fields are updated automatically.

---

## Success Response

HTTP 200

```json
{
  "success": true,
  "message": "Student updated successfully."
}
```

---

## Error Responses

400

Validation failed.

404

Student not found.

409

Business rule violation.

500

Internal server error.

---

# 5.5 Delete Student

## Endpoint

DELETE /api/v1/students/{studentId}

---

## Purpose

Performs a soft delete on a student.

---

## Authorization

Bearer Token Required

Role Required

ADMIN

---

## Business Rules

- Physical deletion is not permitted.
- Student is marked inactive.
- Historical attendance, Quran Sessions, Notes, Promotions, Fee Collection, and Settlement records remain available.
- Students with historical operational records must not lose referential integrity.

---

## Success Response

HTTP 200

```json
{
  "success": true,
  "message": "Student deleted successfully."
}
```

---

## Error Responses

404

Student not found.

409

Student has protected historical records.

500

Internal server error.

---

# Student Management Workflow

```text
Create Student

↓

Initial Marhala Assigned

↓

Automatic MarhalaHistory Created

↓

Student Appears in Student List

↓

Student Participates in Daily Activities

↓

Update Master Profile (If Required)

↓

Soft Delete (If Required)
```

---

# Student Management Security Rules

- ADMIN and HUFFAZ can create and update student profiles.
- Only ADMIN can perform student deletion.
- ITS Number remains immutable after creation.
- All operational history is preserved through soft deletion.
- Marhala changes always create historical records instead of overwriting history.

---

# 6. Student Attendance APIs

The Student Attendance module manages the daily attendance of students.

Attendance is recorded once per student per day and is used for:

- Attendance History
- Dashboard
- Student Reports
- Monthly Reports

Student Attendance does **not** affect Huffaz payable calculations.

Only one attendance record is allowed per student for a given date.

---

# 6.1 Mark Student Attendance

## Endpoint

POST /api/v1/student-attendance

---

## Purpose

Creates a daily attendance record for a student.

---

## Authorization

Bearer Token Required

Roles

- ADMIN
- HUFFAZ

---

## Request Body

```json
{
  "studentId": "uuid",
  "academicMonthId": "uuid",
  "attendanceDate": "2026-07-27",
  "attendanceStatus": "PRESENT",
  "remarks": "Present on time"
}
```

---

## Validation Rules

- studentId is required.
- academicMonthId is required.
- attendanceDate is required.
- attendanceStatus is required.

Allowed attendanceStatus values:

- PRESENT
- ABSENT
- LEAVE
- UZUR

---

## Business Rules

- One attendance record per student per day.
- Attendance date must belong to the selected Academic Month.
- Attendance cannot be recorded for a LOCKED Academic Month.
- Audit information is automatically recorded.

---

## Success Response

HTTP 201

```json
{
  "success": true,
  "message": "Student attendance marked successfully.",
  "data": {
    "id": "uuid",
    "studentId": "uuid",
    "attendanceDate": "2026-07-27",
    "attendanceStatus": "PRESENT"
  }
}
```

---

## Error Responses

400

Validation failed.

404

Student not found.

409

Attendance already exists.

422

Academic Month is locked.

500

Internal server error.

---

# 6.2 Update Student Attendance

## Endpoint

PUT /api/v1/student-attendance/{attendanceId}

---

## Purpose

Updates an existing attendance record.

---

## Authorization

Bearer Token Required

Roles

- ADMIN
- HUFFAZ

---

## Path Parameters

| Parameter    | Description     |
| ------------ | --------------- |
| attendanceId | Attendance UUID |

---

## Request Body

```json
{
  "attendanceStatus": "LEAVE",
  "remarks": "Medical leave"
}
```

---

## Business Rules

- Attendance date cannot be changed.
- Student cannot be changed.
- Academic Month cannot be changed.
- Updates are prohibited after settlement lock.
- Audit fields are updated automatically.

---

## Success Response

HTTP 200

```json
{
  "success": true,
  "message": "Student attendance updated successfully."
}
```

---

## Error Responses

400

Validation failed.

404

Attendance record not found.

422

Academic Month is locked.

500

Internal server error.

---

# 6.3 Get Student Attendance

## Endpoint

GET /api/v1/student-attendance

---

## Purpose

Returns attendance records with filtering and pagination.

---

## Authorization

Bearer Token Required

Roles

- ADMIN
- HUFFAZ

---

## Query Parameters

| Parameter        | Required | Description              |
| ---------------- | -------- | ------------------------ |
| studentId        | No       | Filter by student        |
| academicMonthId  | No       | Filter by Academic Month |
| attendanceDate   | No       | Filter by date           |
| attendanceStatus | No       | Filter by status         |
| page             | No       | Page number              |
| pageSize         | No       | Page size                |

---

## Business Rules

- Results are paginated.
- Multiple filters may be combined.
- Soft deleted records are excluded.

---

## Success Response

HTTP 200

```json
{
  "success": true,
  "message": "Student attendance retrieved successfully.",
  "data": [
    {
      "id": "uuid",
      "studentId": "uuid",
      "studentName": "Ali Burhani",
      "attendanceDate": "2026-07-27",
      "attendanceStatus": "PRESENT"
    }
  ],
  "meta": {
    "page": 1,
    "pageSize": 20,
    "totalRecords": 150,
    "totalPages": 8
  }
}
```

---

## Error Responses

401

Unauthorized.

500

Internal server error.

---

# 6.4 Daily Student Attendance Report

## Endpoint

GET /api/v1/student-attendance/daily-report

---

## Purpose

Returns the attendance summary for a selected day.

---

## Authorization

Bearer Token Required

Roles

- ADMIN
- HUFFAZ

---

## Query Parameters

| Parameter      | Required | Description |
| -------------- | -------- | ----------- |
| attendanceDate | Yes      | Report Date |

---

## Business Rules

Returns:

- Total Students
- Present
- Absent
- Leave
- Uzur

---

## Success Response

HTTP 200

```json
{
  "success": true,
  "message": "Daily attendance report generated successfully.",
  "data": {
    "attendanceDate": "2026-07-27",
    "totalStudents": 120,
    "present": 110,
    "absent": 5,
    "leave": 3,
    "uzur": 2
  }
}
```

---

## Error Responses

400

Attendance Date is required.

500

Internal server error.

---

# 7. Huffaz Attendance APIs

The Huffaz Attendance module records the attendance of Huffaz.

Unlike Student Attendance, Huffaz Attendance directly contributes to Monthly Settlement calculations.

Attendance Status impact:

| Status   | Payable Percentage |
| -------- | -----------------: |
| PRESENT  |               100% |
| HALF_DAY |                50% |
| LEAVE    |                 0% |
| ABSENT   |                 0% |
| UZUR     |                 0% |

---

# 7.1 Mark Huffaz Attendance

## Endpoint

POST /api/v1/huffaz-attendance

---

## Purpose

Creates a daily attendance record for a Huffaz.

---

## Authorization

Bearer Token Required

Role Required

ADMIN

---

## Request Body

```json
{
  "userId": "uuid",
  "academicMonthId": "uuid",
  "attendanceDate": "2026-07-27",
  "attendanceStatus": "PRESENT",
  "remarks": "Present"
}
```

---

## Validation Rules

- userId is required.
- academicMonthId is required.
- attendanceDate is required.
- attendanceStatus is required.

Allowed values:

- PRESENT
- HALF_DAY
- LEAVE
- ABSENT
- UZUR

---

## Business Rules

- One attendance record per Huffaz per day.
- User must have the HUFFAZ role.
- Attendance date must belong to the Academic Month.
- payablePercentage is automatically derived:

| Status   | Payable |
| -------- | ------: |
| PRESENT  |     100 |
| HALF_DAY |      50 |
| LEAVE    |       0 |
| ABSENT   |       0 |
| UZUR     |       0 |

- Locked Academic Months cannot be modified.

---

## Success Response

HTTP 201

```json
{
  "success": true,
  "message": "Huffaz attendance marked successfully.",
  "data": {
    "id": "uuid",
    "userId": "uuid",
    "attendanceDate": "2026-07-27",
    "attendanceStatus": "PRESENT",
    "payablePercentage": 100
  }
}
```

---

## Error Responses

400

Validation failed.

404

Huffaz not found.

409

Attendance already exists.

422

Academic Month is locked.

500

Internal server error.

---

# 7.2 Update Huffaz Attendance

## Endpoint

PUT /api/v1/huffaz-attendance/{attendanceId}

---

## Purpose

Updates Huffaz attendance.

---

## Authorization

Bearer Token Required

Role Required

ADMIN

---

## Path Parameters

| Parameter    | Description     |
| ------------ | --------------- |
| attendanceId | Attendance UUID |

---

## Request Body

```json
{
  "attendanceStatus": "HALF_DAY",
  "remarks": "Left early"
}
```

---

## Business Rules

- payablePercentage is recalculated automatically.
- Attendance Date cannot change.
- User cannot change.
- Academic Month cannot change.
- Updates are prohibited after settlement lock.

---

## Success Response

HTTP 200

```json
{
  "success": true,
  "message": "Huffaz attendance updated successfully."
}
```

---

## Error Responses

400

Validation failed.

404

Attendance record not found.

422

Academic Month is locked.

500

Internal server error.

---

# 7.3 Get Huffaz Attendance

## Endpoint

GET /api/v1/huffaz-attendance

---

## Purpose

Returns Huffaz attendance history.

---

## Authorization

Bearer Token Required

Roles

- ADMIN
- HUFFAZ

---

## Query Parameters

| Parameter        | Required | Description      |
| ---------------- | -------- | ---------------- |
| userId           | No       | Filter by Huffaz |
| academicMonthId  | No       | Academic Month   |
| attendanceDate   | No       | Attendance Date  |
| attendanceStatus | No       | Status           |
| page             | No       | Page Number      |
| pageSize         | No       | Page Size        |

---

## Business Rules

- ADMIN can view all attendance.
- HUFFAZ can view only their own attendance history.
- Soft deleted records are excluded.

---

## Success Response

HTTP 200

```json
{
  "success": true,
  "message": "Huffaz attendance retrieved successfully.",
  "data": [
    {
      "id": "uuid",
      "userId": "uuid",
      "fullName": "Mohammed Ali",
      "attendanceDate": "2026-07-27",
      "attendanceStatus": "PRESENT",
      "payablePercentage": 100
    }
  ],
  "meta": {
    "page": 1,
    "pageSize": 20,
    "totalRecords": 26,
    "totalPages": 2
  }
}
```

---

## Error Responses

401

Unauthorized.

403

Access denied.

500

Internal server error.

---

# Attendance Workflow

```text
Academic Month Active

↓

Daily Attendance

├── Student Attendance

└── Huffaz Attendance

↓

Attendance Review

↓

Reports & Dashboard

↓

Month End

↓

Generate Settlement

↓

LOCK Academic Month

↓

Attendance Becomes Read Only
```

---

# Attendance Security Rules

- Student Attendance can be managed by ADMIN and HUFFAZ.
- Huffaz Attendance can only be managed by ADMIN.
- Duplicate attendance for the same person and date is not permitted.
- Attendance cannot be created or modified after the Academic Month is LOCKED.
- Huffaz attendance automatically determines payablePercentage for Monthly Settlement calculations.
- Student attendance is used for academic reporting only and does not affect financial calculations.

---

# 8. Quran Journey APIs

The Quran Journey module is the core academic module of the application.

Unlike traditional systems that overwrite student progress, every teaching session is stored as an independent Quran Session.

This preserves:

- Complete Learning History
- Teaching Timeline
- Huffaz-wise Session History
- Student Performance
- Historical Reports

Each Quran Session belongs to:

- One Student
- One Huffaz (User)
- One Academic Month

---

# 8.1 Create Quran Session

## Endpoint

POST /api/v1/quran-sessions

---

## Purpose

Creates a new Quran teaching session for a student.

---

## Authorization

Bearer Token Required

Roles

- ADMIN
- HUFFAZ

---

## Request Body

```json
{
  "studentId": "uuid",
  "academicMonthId": "uuid",
  "sessionDate": "2026-07-27",
  "sessionType": "MIXED",
  "siparaNumber": 5,
  "surahName": "Surah Al-Ma'idah",
  "startingAyah": 1,
  "endingAyah": 25,
  "murajaahJuz": 4,
  "murajaahMarks": 90,
  "juzHaaliMarks": 88,
  "jadeedStartAyah": 1,
  "jadeedEndAyah": 25,
  "tasmeeMarks": 92,
  "duration": 45,
  "sessionRemarks": "Excellent revision with minor mistakes."
}
```

---

## Validation Rules

- studentId is required.
- academicMonthId is required.
- sessionDate is required.
- sessionType is required.
- Sipara Number must be between 1 and 30.
- Starting Ayah cannot exceed Ending Ayah.
- Marks must be between 0 and 100.
- Duration must be greater than zero when provided.

---

## Business Rules

- The authenticated HUFFAZ becomes the session teacher automatically.
- ADMIN may create sessions on behalf of a Huffaz.
- Every submission creates a new historical record.
- Existing Quran Sessions are never overwritten.
- Session Date must belong to the selected Academic Month.
- Sessions cannot be created after the Academic Month is LOCKED.

---

## Success Response

HTTP 201

```json
{
  "success": true,
  "message": "Quran session created successfully.",
  "data": {
    "id": "uuid",
    "studentId": "uuid",
    "sessionDate": "2026-07-27",
    "sessionType": "MIXED"
  }
}
```

---

## Error Responses

400

Validation failed.

404

Student not found.

422

Academic Month is locked.

500

Internal server error.

---

# 8.2 Get Quran Sessions

## Endpoint

GET /api/v1/quran-sessions

---

## Purpose

Returns Quran Session history.

Supports filtering and pagination.

---

## Authorization

Bearer Token Required

Roles

- ADMIN
- HUFFAZ

---

## Query Parameters

| Parameter       | Required | Description              |
| --------------- | -------- | ------------------------ |
| studentId       | No       | Filter by student        |
| userId          | No       | Filter by Huffaz         |
| academicMonthId | No       | Filter by Academic Month |
| sessionDate     | No       | Filter by session date   |
| sessionType     | No       | HIFZ / MURAJAAH / MIXED  |
| page            | No       | Page number              |
| pageSize        | No       | Page size                |

---

## Business Rules

- ADMIN can view all sessions.
- HUFFAZ can view all sessions unless future role restrictions are introduced.
- Results are ordered by newest session first.

---

## Success Response

HTTP 200

```json
{
  "success": true,
  "message": "Quran sessions retrieved successfully.",
  "data": [
    {
      "id": "uuid",
      "studentName": "Ali Burhani",
      "huffazName": "Mohammed Ali",
      "sessionDate": "2026-07-27",
      "sessionType": "MIXED",
      "surahName": "Surah Al-Ma'idah"
    }
  ],
  "meta": {
    "page": 1,
    "pageSize": 20,
    "totalRecords": 245,
    "totalPages": 13
  }
}
```

---

## Error Responses

401

Unauthorized.

500

Internal server error.

---

# 8.3 Get Quran Session Details

## Endpoint

GET /api/v1/quran-sessions/{sessionId}

---

## Purpose

Returns the complete details of a Quran Session.

---

## Authorization

Bearer Token Required

Roles

- ADMIN
- HUFFAZ

---

## Path Parameters

| Parameter | Description        |
| --------- | ------------------ |
| sessionId | Quran Session UUID |

---

## Business Rules

- Session must exist.
- Historical values are returned exactly as recorded.

---

## Success Response

HTTP 200

```json
{
  "success": true,
  "message": "Quran session retrieved successfully.",
  "data": {
    "id": "uuid",
    "studentName": "Ali Burhani",
    "huffazName": "Mohammed Ali",
    "sessionDate": "2026-07-27",
    "sessionType": "MIXED",
    "siparaNumber": 5,
    "surahName": "Surah Al-Ma'idah",
    "startingAyah": 1,
    "endingAyah": 25,
    "murajaahJuz": 4,
    "murajaahMarks": 90,
    "juzHaaliMarks": 88,
    "jadeedStartAyah": 1,
    "jadeedEndAyah": 25,
    "tasmeeMarks": 92,
    "duration": 45,
    "sessionRemarks": "Excellent revision with minor mistakes."
  }
}
```

---

## Error Responses

404

Quran Session not found.

500

Internal server error.

---

# 8.4 Update Quran Session

## Endpoint

PUT /api/v1/quran-sessions/{sessionId}

---

## Purpose

Updates a Quran Session when corrections are required.

---

## Authorization

Bearer Token Required

Roles

- ADMIN
- HUFFAZ

---

## Path Parameters

| Parameter | Description        |
| --------- | ------------------ |
| sessionId | Quran Session UUID |

---

## Business Rules

- Session Date cannot be changed.
- Student cannot be changed.
- Huffaz cannot be changed.
- Academic Month cannot be changed.
- Updates are prohibited after the Academic Month is LOCKED.
- Audit fields are updated automatically.

---

## Success Response

HTTP 200

```json
{
  "success": true,
  "message": "Quran session updated successfully."
}
```

---

## Error Responses

400

Validation failed.

404

Quran Session not found.

422

Academic Month is locked.

500

Internal server error.

---

# 8.5 Student Quran Timeline

## Endpoint

GET /api/v1/students/{studentId}/quran-timeline

---

## Purpose

Returns the complete chronological Quran learning timeline of a student.

---

## Authorization

Bearer Token Required

Roles

- ADMIN
- HUFFAZ

---

## Path Parameters

| Parameter | Description  |
| --------- | ------------ |
| studentId | Student UUID |

---

## Business Rules

- Sessions are returned in chronological order.
- Timeline represents the complete learning journey.
- Historical sessions are never excluded unless soft deleted.

---

## Success Response

HTTP 200

```json
{
  "success": true,
  "message": "Student Quran timeline retrieved successfully.",
  "data": [
    {
      "sessionDate": "2026-07-10",
      "sessionType": "HIFZ",
      "surahName": "Surah An-Nisa",
      "huffazName": "Mohammed Ali"
    },
    {
      "sessionDate": "2026-07-27",
      "sessionType": "MIXED",
      "surahName": "Surah Al-Ma'idah",
      "huffazName": "Mohammed Ali"
    }
  ]
}
```

---

# 9. Student Notes APIs

Student Notes store general observations that are independent of Quran Sessions.

Examples:

- Behaviour
- Parent Meeting
- Medical Information
- Discipline
- Special Instructions

---

# 9.1 Create Student Note

## Endpoint

POST /api/v1/student-notes

---

## Purpose

Creates a new note for a student.

---

## Authorization

Bearer Token Required

Roles

- ADMIN
- HUFFAZ

---

## Request Body

```json
{
  "studentId": "uuid",
  "title": "Parent Meeting",
  "note": "Discussed improvement in daily revision."
}
```

---

## Validation Rules

- studentId is required.
- note is required.
- Title maximum length: 150 characters.

---

## Business Rules

- Notes are independent from Quran Sessions.
- Notes are timestamped automatically.
- Notes cannot be created after Academic Month lock when tied to a locked operational period.

---

## Success Response

HTTP 201

```json
{
  "success": true,
  "message": "Student note created successfully."
}
```

---

## Error Responses

400

Validation failed.

404

Student not found.

500

Internal server error.

---

# 9.2 Get Student Notes

## Endpoint

GET /api/v1/student-notes

---

## Purpose

Returns student notes.

---

## Authorization

Bearer Token Required

Roles

- ADMIN
- HUFFAZ

---

## Query Parameters

| Parameter | Required | Description  |
| --------- | -------- | ------------ |
| studentId | No       | Student UUID |
| page      | No       | Page Number  |
| pageSize  | No       | Page Size    |

---

## Business Rules

- Notes are sorted by newest first.
- Pagination is supported.

---

## Success Response

HTTP 200

```json
{
  "success": true,
  "message": "Student notes retrieved successfully.",
  "data": [
    {
      "id": "uuid",
      "title": "Parent Meeting",
      "note": "Discussed improvement in daily revision.",
      "createdAt": "2026-07-27T10:30:15Z",
      "createdBy": "Mohammed Ali"
    }
  ]
}
```

---

## Error Responses

401

Unauthorized.

500

Internal server error.

---

# 9.3 Update Student Note

## Endpoint

PUT /api/v1/student-notes/{noteId}

---

## Purpose

Updates an existing student note.

---

## Authorization

Bearer Token Required

Roles

- ADMIN
- HUFFAZ

---

## Business Rules

- Student association cannot change.
- Audit fields are updated automatically.
- Updates are prohibited after the related Academic Month is LOCKED.

---

## Success Response

HTTP 200

```json
{
  "success": true,
  "message": "Student note updated successfully."
}
```

---

## Error Responses

400

Validation failed.

404

Student note not found.

422

Academic Month is locked.

500

Internal server error.

---

# 9.4 Delete Student Note

## Endpoint

DELETE /api/v1/student-notes/{noteId}

---

## Purpose

Performs a soft delete of a student note.

---

## Authorization

Bearer Token Required

Roles

- ADMIN
- HUFFAZ

---

## Business Rules

- Physical deletion is not permitted.
- Historical audit information is preserved.
- Deletion is prohibited after the related Academic Month is LOCKED.

---

## Success Response

HTTP 200

```json
{
  "success": true,
  "message": "Student note deleted successfully."
}
```

---

## Error Responses

404

Student note not found.

422

Academic Month is locked.

500

Internal server error.

---

# Quran Journey Workflow

```text
Student Attends Class

↓

Huffaz Conducts Session

↓

Create Quran Session

↓

Session Stored as Historical Record

↓

Student Timeline Updated

↓

Reports & Dashboard Updated

↓

Academic Month Locked

↓

Sessions Become Read Only
```

---

# Student Notes Workflow

```text
Student Observation

↓

Create Student Note

↓

Update (If Required)

↓

Visible in Student History

↓

Academic Month Locked

↓

Read Only
```

---

# Quran Journey & Notes Security Rules

- ADMIN and HUFFAZ can create and update Quran Sessions.
- ADMIN and HUFFAZ can manage Student Notes.
- Every Quran Session is an independent historical record.
- Existing Quran Sessions are never overwritten by creating new sessions.
- Student Timeline is generated from Quran Session history.
- Quran Sessions and Student Notes become read-only after the Academic Month is LOCKED.

---

# 10. Student Fee Collection APIs

The Student Fee Collection module manages the monthly fee records of students.

Each Academic Month contains exactly one Student Fee Collection record per active student.

Individual payments are stored separately as Fee Payment Transactions, allowing support for:

- Full Payments
- Partial Payments
- Multiple Installments
- Discounts
- Waivers

Only the actual amount received contributes to the Monthly Settlement payable pool.

---

# 10.1 Generate Student Fee Collections

## Endpoint

POST /api/v1/student-fee-collections/generate

---

## Purpose

Automatically generates monthly fee collection records for all active students in the selected Academic Month.

---

## Authorization

Bearer Token Required

Role Required

ADMIN

---

## Request Body

```json
{
  "academicMonthId": "uuid"
}
```

---

## Validation Rules

- academicMonthId is required.

---

## Business Rules

- Only one generation is allowed per Academic Month.
- Generates one Student Fee Collection record for every active student.
- Configured Fee is copied from Marhala Fee Configuration.
- Existing records are not duplicated.
- Generation is prohibited after settlement generation.

---

## Success Response

HTTP 201

```json
{
  "success": true,
  "message": "Student fee collections generated successfully.",
  "data": {
    "academicMonthId": "uuid",
    "generatedRecords": 120
  }
}
```

---

## Error Responses

400

Validation failed.

404

Academic Month not found.

409

Fee collections already generated.

422

Settlement already generated.

500

Internal server error.

---

# 10.2 Get Student Fee Collections

## Endpoint

GET /api/v1/student-fee-collections

---

## Purpose

Returns Student Fee Collection records.

---

## Authorization

Bearer Token Required

Roles

- ADMIN

---

## Query Parameters

| Parameter       | Required | Description    |
| --------------- | -------- | -------------- |
| academicMonthId | No       | Academic Month |
| studentId       | No       | Student        |
| paymentStatus   | No       | Payment Status |
| page            | No       | Page Number    |
| pageSize        | No       | Page Size      |

---

## Business Rules

- Results support filtering and pagination.
- Outstanding Amount is returned.
- Total Received Amount is returned.

---

## Success Response

HTTP 200

```json
{
  "success": true,
  "message": "Student fee collections retrieved successfully.",
  "data": [
    {
      "id": "uuid",
      "studentName": "Ali Burhani",
      "configuredFee": 800,
      "totalReceivedAmount": 500,
      "outstandingAmount": 300,
      "paymentStatus": "PARTIAL_PAID"
    }
  ]
}
```

---

## Error Responses

401

Unauthorized.

500

Internal server error.

---

# 10.3 Record Fee Payment

## Endpoint

POST /api/v1/fee-payment-transactions

---

## Purpose

Records a payment transaction against a Student Fee Collection.

Supports installment payments.

---

## Authorization

Bearer Token Required

Role Required

ADMIN

---

## Request Body

```json
{
  "studentFeeCollectionId": "uuid",
  "transactionDate": "2026-07-27",
  "amount": 300,
  "paymentMode": "UPI",
  "referenceNumber": "UPI123456",
  "remarks": "First installment"
}
```

---

## Validation Rules

- studentFeeCollectionId is required.
- amount must be greater than zero.
- paymentMode is required.

---

## Business Rules

- Multiple transactions are allowed.
- Total Received Amount is recalculated automatically.
- Outstanding Amount is recalculated automatically.
- Payment Status is recalculated automatically.
- Transactions cannot be recorded after settlement lock.

---

## Success Response

HTTP 201

```json
{
  "success": true,
  "message": "Payment recorded successfully.",
  "data": {
    "transactionId": "uuid",
    "amount": 300,
    "paymentStatus": "PARTIAL_PAID"
  }
}
```

---

## Error Responses

400

Validation failed.

404

Student Fee Collection not found.

422

Academic Month is locked.

500

Internal server error.

---

# 10.4 Update Fee Payment

## Endpoint

PUT /api/v1/fee-payment-transactions/{transactionId}

---

## Purpose

Updates an existing payment transaction.

---

## Authorization

Bearer Token Required

Role Required

ADMIN

---

## Path Parameters

| Parameter     | Description              |
| ------------- | ------------------------ |
| transactionId | Payment Transaction UUID |

---

## Business Rules

- Payment Amount may be corrected.
- Student Fee Collection cannot change.
- Academic Month cannot change.
- Payment Status is recalculated automatically.
- Locked months prohibit updates.

---

## Success Response

HTTP 200

```json
{
  "success": true,
  "message": "Payment transaction updated successfully."
}
```

---

## Error Responses

400

Validation failed.

404

Payment transaction not found.

422

Academic Month is locked.

500

Internal server error.

---

# 10.5 Get Payment Transactions

## Endpoint

GET /api/v1/fee-payment-transactions

---

## Purpose

Returns payment transaction history.

---

## Authorization

Bearer Token Required

Role Required

ADMIN

---

## Query Parameters

| Parameter              | Required | Description            |
| ---------------------- | -------- | ---------------------- |
| studentFeeCollectionId | No       | Student Fee Collection |
| transactionDate        | No       | Payment Date           |
| paymentMode            | No       | Payment Mode           |
| page                   | No       | Page Number            |
| pageSize               | No       | Page Size              |

---

## Business Rules

- Results are sorted by latest transaction first.
- Soft deleted transactions are excluded.

---

## Success Response

HTTP 200

```json
{
  "success": true,
  "message": "Payment transactions retrieved successfully.",
  "data": [
    {
      "id": "uuid",
      "transactionDate": "2026-07-27",
      "amount": 300,
      "paymentMode": "UPI",
      "referenceNumber": "UPI123456"
    }
  ]
}
```

---

# 11. Monthly Settlement APIs

The Monthly Settlement module finalizes the financial activities of an Academic Month.

Settlement is generated only after:

- Student Attendance is completed.
- Huffaz Attendance is completed.
- Quran Sessions are completed.
- Student Fee Collections are finalized.

Once locked, the Academic Month becomes read-only.

---

# 11.1 Generate Monthly Settlement

## Endpoint

POST /api/v1/monthly-settlements/generate

---

## Purpose

Generates Monthly Settlement for the selected Academic Month.

---

## Authorization

Bearer Token Required

Role Required

ADMIN

---

## Request Body

```json
{
  "academicMonthId": "uuid"
}
```

---

## Business Rules

The system automatically:

- Calculates Total Collection.
- Calculates Payable Pool.
- Calculates Huffaz attendance percentage.
- Generates Monthly Settlement.
- Generates Monthly Settlement Details.

Settlement generation is allowed only once.

---

## Success Response

HTTP 201

```json
{
  "success": true,
  "message": "Monthly settlement generated successfully.",
  "data": {
    "settlementId": "uuid",
    "settlementStatus": "GENERATED"
  }
}
```

---

## Error Responses

404

Academic Month not found.

409

Settlement already exists.

422

Business rule violation.

500

Internal server error.

---

# 11.2 Get Monthly Settlements

## Endpoint

GET /api/v1/monthly-settlements

---

## Purpose

Returns Monthly Settlement summaries.

---

## Authorization

Bearer Token Required

Role Required

ADMIN

---

## Query Parameters

| Parameter        | Required | Description       |
| ---------------- | -------- | ----------------- |
| academicMonthId  | No       | Academic Month    |
| settlementStatus | No       | Settlement Status |

---

## Success Response

HTTP 200

```json
{
  "success": true,
  "message": "Monthly settlements retrieved successfully.",
  "data": [
    {
      "id": "uuid",
      "academicMonth": "July 2026",
      "totalCollectedAmount": 95000,
      "totalPayablePool": 95000,
      "settlementStatus": "GENERATED"
    }
  ]
}
```

---

# 11.3 Get Monthly Settlement Details

## Endpoint

GET /api/v1/monthly-settlements/{settlementId}

---

## Purpose

Returns complete settlement information including payable details for every Huffaz.

---

## Authorization

Bearer Token Required

Role Required

ADMIN

---

## Path Parameters

| Parameter    | Description     |
| ------------ | --------------- |
| settlementId | Settlement UUID |

---

## Success Response

HTTP 200

```json
{
  "success": true,
  "message": "Settlement details retrieved successfully.",
  "data": {
    "academicMonth": "July 2026",
    "settlementStatus": "GENERATED",
    "details": [
      {
        "huffazName": "Mohammed Ali",
        "attendancePercentage": 100,
        "calculatedAmount": 25000,
        "bonusAmount": 500,
        "deductionAmount": 0,
        "finalPayableAmount": 25500
      }
    ]
  }
}
```

---

# 11.4 Apply Settlement Adjustment

## Endpoint

POST /api/v1/monthly-settlements/{settlementId}/adjustments

---

## Purpose

Applies a manual Bonus or Deduction to a Huffaz settlement.

---

## Authorization

Bearer Token Required

Role Required

ADMIN

---

## Request Body

```json
{
  "userId": "uuid",
  "adjustmentType": "BONUS",
  "amount": 500,
  "reason": "Outstanding performance"
}
```

---

## Validation Rules

- userId is required.
- adjustmentType is required.
- amount must be greater than zero.
- reason is required.

---

## Business Rules

- Every adjustment creates a Settlement Adjustment record.
- Final Payable Amount is recalculated automatically.
- Adjustments are prohibited after settlement lock.

---

## Success Response

HTTP 201

```json
{
  "success": true,
  "message": "Settlement adjustment applied successfully."
}
```

---

## Error Responses

400

Validation failed.

404

Settlement not found.

422

Settlement is locked.

500

Internal server error.

---

# 11.5 Lock Monthly Settlement

## Endpoint

POST /api/v1/monthly-settlements/{settlementId}/lock

---

## Purpose

Locks the Monthly Settlement and the associated Academic Month.

---

## Authorization

Bearer Token Required

Role Required

ADMIN

---

## Business Rules

After locking:

- Student Attendance becomes read-only.
- Huffaz Attendance becomes read-only.
- Quran Sessions become read-only.
- Student Fee Collections become read-only.
- Fee Payment Transactions become read-only.
- Settlement Adjustments become read-only.

Locking cannot be reversed through the standard API.

---

## Success Response

HTTP 200

```json
{
  "success": true,
  "message": "Monthly settlement locked successfully.",
  "data": {
    "settlementStatus": "LOCKED",
    "lockedAt": "2026-07-31T18:00:00Z"
  }
}
```

---

## Error Responses

404

Settlement not found.

409

Settlement already locked.

500

Internal server error.

---

# Finance Workflow

```text
Academic Month Starts

↓

Generate Student Fee Collections

↓

Record Student Payments

↓

Update Payment Status Automatically

↓

Academic Month Ends

↓

Generate Monthly Settlement

↓

Review Settlement

↓

Apply Bonus / Deduction (Optional)

↓

Lock Settlement

↓

Academic Month Becomes Read Only
```

---

# Finance Security Rules

- Only ADMIN users can manage Student Fee Collections.
- Only ADMIN users can record Fee Payment Transactions.
- Multiple payment transactions are supported for installment payments.
- Payment Status is automatically derived from financial data.
- Monthly Settlement can be generated only once per Academic Month.
- Locked settlements cannot be modified.
- Financial calculations are always based on the actual amount received from students.

---

# 12. Dashboard APIs

The Dashboard module provides a consolidated overview of the application's current operational and financial status.

Dashboard data is intended for the home screen of the React Native application and should be optimized for fast retrieval.

---

# 12.1 Get Dashboard Summary

## Endpoint

GET /api/v1/dashboard

---

## Purpose

Returns the dashboard summary for the currently selected Academic Month.

---

## Authorization

Bearer Token Required

Roles

- ADMIN
- HUFFAZ

---

## Query Parameters

| Parameter       | Required | Description         |
| --------------- | -------- | ------------------- |
| academicMonthId | No       | Academic Month UUID |

If omitted, the current Academic Month is used.

---

## Business Rules

### ADMIN Dashboard

Returns:

- Active Students
- Active Huffaz
- Today's Student Attendance
- Today's Huffaz Attendance
- Total Quran Sessions
- Monthly Fee Collection
- Outstanding Fees
- Settlement Status

### HUFFAZ Dashboard

Returns:

- Today's Attendance
- Today's Assigned Sessions
- Monthly Session Count
- Personal Attendance Percentage

---

## Success Response

HTTP 200

```json
{
  "success": true,
  "message": "Dashboard data retrieved successfully.",
  "data": {
    "totalStudents": 120,
    "totalHuffaz": 8,
    "studentAttendanceToday": 112,
    "huffazAttendanceToday": 8,
    "totalQuranSessions": 1045,
    "totalCollectedAmount": 95000,
    "outstandingAmount": 18000,
    "settlementStatus": "DRAFT"
  }
}
```

---

## Error Responses

401

Unauthorized.

500

Internal server error.

---

# 13. Reports APIs

Reports provide analytical information for students, attendance, fee collections, and settlements.

Reports are read-only.

---

# 13.1 Student Report

## Endpoint

GET /api/v1/reports/students

---

## Purpose

Returns student summary information.

---

## Authorization

Bearer Token Required

Roles

- ADMIN
- HUFFAZ

---

## Query Parameters

| Parameter       | Description    |
| --------------- | -------------- |
| status          | Student Status |
| marhalaId       | Marhala        |
| academicMonthId | Academic Month |

---

## Success Response

HTTP 200

```json
{
  "success": true,
  "message": "Student report generated successfully.",
  "data": [
    {
      "studentName": "Ali Burhani",
      "marhala": "Marhala Ula",
      "status": "ACTIVE"
    }
  ]
}
```

---

# 13.2 Attendance Report

## Endpoint

GET /api/v1/reports/attendance

---

## Purpose

Returns attendance statistics.

---

## Authorization

Bearer Token Required

Roles

- ADMIN
- HUFFAZ

---

## Query Parameters

| Parameter       | Description      |
| --------------- | ---------------- |
| academicMonthId | Academic Month   |
| attendanceType  | STUDENT / HUFFAZ |

---

## Success Response

HTTP 200

```json
{
  "success": true,
  "message": "Attendance report generated successfully.",
  "data": {
    "present": 110,
    "halfDay": 2,
    "leave": 3,
    "absent": 4,
    "uzur": 1
  }
}
```

---

# 13.3 Fee Collection Report

## Endpoint

GET /api/v1/reports/fee-collections

---

## Purpose

Returns fee collection summaries.

---

## Authorization

Bearer Token Required

Role Required

ADMIN

---

## Query Parameters

| Parameter       | Description    |
| --------------- | -------------- |
| academicMonthId | Academic Month |
| paymentStatus   | Payment Status |

---

## Success Response

HTTP 200

```json
{
  "success": true,
  "message": "Fee collection report generated successfully.",
  "data": {
    "configuredAmount": 120000,
    "receivedAmount": 95000,
    "outstandingAmount": 25000
  }
}
```

---

# 13.4 Monthly Settlement Report

## Endpoint

GET /api/v1/reports/monthly-settlements

---

## Purpose

Returns finalized settlement information.

---

## Authorization

Bearer Token Required

Role Required

ADMIN

---

## Query Parameters

| Parameter       | Description    |
| --------------- | -------------- |
| academicMonthId | Academic Month |

---

## Success Response

HTTP 200

```json
{
  "success": true,
  "message": "Settlement report generated successfully.",
  "data": [
    {
      "huffazName": "Mohammed Ali",
      "attendancePercentage": 100,
      "finalPayableAmount": 25500
    }
  ]
}
```

---

# 14. Media APIs

Media APIs manage image uploads used by the application.

Media files are stored in Cloudinary.

The database stores only the metadata and URL.

---

# 14.1 Upload Media

## Endpoint

POST /api/v1/media/upload

---

## Purpose

Uploads an image to Cloudinary.

---

## Authorization

Bearer Token Required

Roles

- ADMIN
- HUFFAZ

---

## Request

Content-Type

```http
multipart/form-data
```

Field

```text
file
```

---

## Supported File Types

- JPG
- JPEG
- PNG
- WEBP

---

## Validation Rules

- Maximum size: 5 MB
- Image only
- Virus scanning (future enhancement)

---

## Success Response

HTTP 201

```json
{
  "success": true,
  "message": "Image uploaded successfully.",
  "data": {
    "mediaId": "uuid",
    "url": "https://res.cloudinary.com/demo/image/upload/sample.jpg"
  }
}
```

---

## Error Responses

400

Invalid file.

413

File too large.

500

Upload failed.

---

# 14.2 Delete Media

## Endpoint

DELETE /api/v1/media/{mediaId}

---

## Purpose

Deletes a media reference.

Cloudinary deletion may be immediate or deferred depending on implementation.

---

## Authorization

Bearer Token Required

Role Required

ADMIN

---

## Success Response

HTTP 200

```json
{
  "success": true,
  "message": "Media deleted successfully."
}
```

---

## Error Responses

404

Media not found.

500

Internal server error.

---

# 15. Security Guidelines

The backend shall enforce the following security standards:

## Authentication

- JWT Access Token
- JWT Refresh Token
- BCrypt password hashing

---

## Authorization

Role-Based Access Control (RBAC)

Roles:

- ADMIN
- HUFFAZ

Every protected endpoint must validate both authentication and authorization before executing business logic.

---

## Input Validation

All incoming requests must be validated using schema validation.

Validation includes:

- Required fields
- Data types
- Length limits
- Enum values
- UUID format
- Date validation
- Business rule validation

---

## Sensitive Data

The following fields must never be returned in API responses:

- passwordHash
- refreshToken
- deletedBy
- internal audit metadata (unless explicitly required)
- internal database identifiers unrelated to the API consumer

---

## Audit Logging

Every Create, Update, Delete, Login, and Settlement operation should generate an audit log entry containing:

- User ID
- Action
- Entity
- Entity ID
- Timestamp
- IP Address (future enhancement)
- Device Information (future enhancement)

---

# 16. Rate Limiting

To protect the backend from abuse, rate limiting should be implemented.

Recommended defaults:

| Endpoint      | Limit                    |
| ------------- | ------------------------ |
| Login         | 5 requests/minute/IP     |
| Refresh Token | 10 requests/minute       |
| General APIs  | 100 requests/minute/user |
| Media Upload  | 20 uploads/hour/user     |

Exceeding the limit should return:

HTTP 429

```json
{
  "success": false,
  "message": "Too many requests.",
  "code": "RATE_LIMIT_EXCEEDED"
}
```

---

# 17. API Best Practices

- Use HTTPS for all environments except local development.
- Return consistent JSON structures.
- Use standard HTTP status codes.
- Keep endpoints resource-oriented.
- Never expose implementation details.
- Implement pagination for list endpoints.
- Validate all user input.
- Use UTC timestamps.
- Keep endpoints backward compatible within the same API version.
- Avoid breaking changes without version increments.

---

# 18. Implementation Guidelines

The API layer should follow the following architecture:

```text
React Native App

↓

Express Routes

↓

Controllers

↓

Services

↓

Prisma Repository Layer

↓

PostgreSQL Database
```

Each layer should have a single responsibility:

- Routes: Endpoint definitions
- Controllers: Request/Response handling
- Services: Business logic
- Repository (Prisma): Database access
- Database: Persistent storage

Business rules should reside in the Service layer rather than Controllers or Prisma models.

---

# 19. API Documentation Completion Summary

## Modules Covered

- Authentication
- User Management
- Academic Management
- Student Management
- Student Attendance
- Huffaz Attendance
- Quran Journey
- Student Notes
- Student Fee Collection
- Fee Payment Transactions
- Monthly Settlement
- Dashboard
- Reports
- Media

---

## Global Standards

- RESTful API Design
- JWT Authentication
- Role-Based Authorization
- Standard Request/Response Format
- Pagination
- Filtering
- Validation
- Error Handling
- Audit Logging
- Rate Limiting
- API Versioning

---

## Implementation Readiness

This API specification is the implementation contract for:

- React Native Mobile Application
- Node.js / Express Controllers
- Service Layer
- Prisma ORM
- Swagger / OpenAPI Documentation
- Postman Collection
- API Test Cases

All endpoints, request/response models, authorization rules, validation rules, and business constraints have been defined and align with the previously completed **01-Requirements.md** and **02-Database-Schema.md** documents.
