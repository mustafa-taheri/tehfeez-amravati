# Quran Tehfeez Management System

## Setup & Installation Guide

**Version:** 1.0

**Platform:** React Native (Expo)

**Backend:** Node.js + Express.js

**Database:** PostgreSQL

**ORM:** Prisma

---

# 1. Introduction

## Purpose

This document provides the complete setup and installation guide for the Quran Tehfeez Management System.

It is intended to help developers configure, run, maintain, and deploy the application across different environments.

The guide covers:

- Development environment setup
- Project installation
- Backend configuration
- Mobile application configuration
- Database initialization
- Deployment preparation
- Development workflow
- Troubleshooting

Following this guide, a developer should be able to set up the project from scratch without additional documentation.

---

## Intended Audience

This document is intended for:

- Software Developers
- Mobile Developers
- Backend Developers
- DevOps Engineers
- Technical Reviewers
- Future Project Maintainers

Basic knowledge of the following technologies is recommended:

- JavaScript
- TypeScript
- React Native
- Node.js
- Express.js
- PostgreSQL
- Git
- REST APIs

---

## Project Overview

The Quran Tehfeez Management System is a mobile application designed to digitize the daily operations of a Quran Tehfeez institute.

The system enables:

- User Authentication
- Student Management
- Student Attendance
- Huffaz Attendance
- Quran Session Management
- Student Notes
- Student Fee Collection
- Monthly Settlement
- Reports & Dashboard

The application follows a client-server architecture where the React Native application communicates with a RESTful backend built using Express.js and Prisma ORM.

---

## Architecture Overview

```text
                 React Native (Expo)

                         │

                  HTTPS REST APIs

                         │

              Node.js + Express.js

                         │

                    Prisma ORM

                         │

                  PostgreSQL Database

                         │

                    Cloudinary CDN
                  (Image Storage)
```

---

# 2. Technology Stack

The project uses modern, open-source technologies to provide a scalable, maintainable, and production-ready architecture.

---

## Mobile Application

| Technology                 | Purpose                           |
| -------------------------- | --------------------------------- |
| React Native               | Cross-platform mobile development |
| Expo                       | Development framework and tooling |
| React Navigation           | Screen navigation                 |
| React Native Paper         | Material Design UI components     |
| React Hook Form            | Form handling and validation      |
| React Native Gifted Charts | Dashboard and analytical charts   |

---

## Backend

| Technology | Purpose            |
| ---------- | ------------------ |
| Node.js    | JavaScript runtime |
| Express.js | REST API framework |
| Prisma ORM | Database ORM       |
| JWT        | Authentication     |
| BCrypt     | Password hashing   |

---

## Database

| Technology | Purpose                     |
| ---------- | --------------------------- |
| PostgreSQL | Primary relational database |

---

## Media Storage

| Technology | Purpose                  |
| ---------- | ------------------------ |
| Cloudinary | Image upload and storage |

---

## Development Tools

| Tool               | Purpose                                   |
| ------------------ | ----------------------------------------- |
| Git                | Version control                           |
| GitHub             | Source code repository                    |
| Visual Studio Code | Code editor                               |
| Prisma CLI         | Database migrations and schema management |
| Postman            | API testing                               |
| Android Studio     | Android emulator and SDK                  |
| Xcode (macOS)      | iOS simulator and builds                  |

---

## Deployment

| Component | Platform                           |
| --------- | ---------------------------------- |
| Backend   | Render                             |
| Database  | Neon PostgreSQL                    |
| Mobile    | Expo EAS Build / Google Play Store |

---

# 3. System Requirements

Before setting up the project, ensure that the development machine satisfies the following minimum requirements.

---

## Hardware Requirements

| Component    | Minimum    | Recommended                  |
| ------------ | ---------- | ---------------------------- |
| Processor    | Dual Core  | Quad Core or higher          |
| Memory (RAM) | 8 GB       | 16 GB                        |
| Storage      | 20 GB Free | 50 GB Free                   |
| Internet     | Broadband  | Stable high-speed connection |

---

## Operating Systems

Supported development platforms:

- Windows 10 or later
- macOS 12 or later
- Ubuntu 22.04 LTS or later

---

## Node.js

Recommended version:

```text
Node.js 22.x LTS
```

Verify installation:

```bash
node -v
npm -v
```

---

## PostgreSQL

Recommended version:

```text
PostgreSQL 16+
```

Verify installation:

```bash
psql --version
```

---

## Git

Recommended version:

```text
Git 2.40+
```

Verify installation:

```bash
git --version
```

---

## Expo CLI

Install globally if not already available:

```bash
npm install -g expo
```

Verify installation:

```bash
expo --version
```

---

## Prisma CLI

Install as a development dependency:

```bash
npm install prisma --save-dev
```

Verify installation:

```bash
npx prisma --version
```

---

# 4. Development Environment

The development environment consists of the backend server, PostgreSQL database, and React Native mobile application.

All components should be installed before running the project.

---

## Required Software

### Visual Studio Code

Recommended extensions:

- ESLint
- Prettier
- Prisma
- GitLens
- DotENV
- Error Lens
- React Native Tools

---

### Android Studio

Required components:

- Android SDK
- Android SDK Platform Tools
- Android Emulator
- Android Virtual Device (AVD)

Recommended Android API Level:

```text
Android API 35+
```

---

### Xcode (macOS Only)

Required for:

- iOS Simulator
- iOS Builds
- Apple Device Testing

Ensure:

- Xcode Command Line Tools are installed
- CocoaPods is available

---

### PostgreSQL

Install PostgreSQL locally and create a dedicated development database.

Default configuration example:

```text
Host: localhost
Port: 5432
Database: quran_tehfeez
Username: postgres
Password: ********
```

---

### Git

Configure Git before cloning the project:

```bash
git config --global user.name "Your Name"
git config --global user.email "your@email.com"
```

---

### Postman

Recommended for:

- API Testing
- Authentication Testing
- Request Collections
- Environment Variables

---

### Cloudinary Account

Create a Cloudinary account and obtain:

- Cloud Name
- API Key
- API Secret

These values will be configured through environment variables.

---

# 5. Development Environment Verification

Before proceeding to installation, verify that all required software is available.

| Software   | Verification Command   |
| ---------- | ---------------------- |
| Node.js    | `node -v`              |
| npm        | `npm -v`               |
| Git        | `git --version`        |
| PostgreSQL | `psql --version`       |
| Prisma     | `npx prisma --version` |
| Expo       | `expo --version`       |

All commands should execute successfully before continuing.

---

# Development Checklist

Before moving to the installation steps, confirm the following:

- ✅ Node.js installed
- ✅ npm installed
- ✅ Git installed
- ✅ PostgreSQL installed
- ✅ Prisma CLI available
- ✅ Expo CLI installed
- ✅ Visual Studio Code installed
- ✅ Android Studio configured
- ✅ Android Emulator created
- ✅ Cloudinary account created
- ✅ Postman installed

---

# 3. Project Structure

The project follows a modular architecture with a clear separation between the mobile application, backend services, database schema, and documentation.

This structure improves maintainability, scalability, and collaboration by allowing frontend and backend development to progress independently while sharing a common business model.

---

## High-Level Repository Structure

```text
quran-tehfeez-system/

├── mobile-app/                 # React Native (Expo)
├── backend/                    # Node.js + Express API
├── docs/                       # Project documentation
├── .gitignore
├── README.md
└── LICENSE
```

---

# Mobile Application Structure

```text
mobile-app/

├── assets/
│   ├── fonts/
│   ├── icons/
│   └── images/
│
├── src/
│
│   ├── api/
│   │   ├── auth.api.ts
│   │   ├── student.api.ts
│   │   ├── attendance.api.ts
│   │   ├── quranSession.api.ts
│   │   ├── finance.api.ts
│   │   └── report.api.ts
│   │
│   ├── components/
│   │
│   ├── constants/
│   │
│   ├── hooks/
│   │
│   ├── navigation/
│   │
│   ├── screens/
│   │   ├── auth/
│   │   ├── dashboard/
│   │   ├── students/
│   │   ├── attendance/
│   │   ├── quran/
│   │   ├── finance/
│   │   ├── reports/
│   │   └── profile/
│   │
│   ├── services/
│   │
│   ├── store/
│   │
│   ├── theme/
│   │
│   ├── types/
│   │
│   ├── utils/
│   │
│   └── App.tsx
│
├── app.json
├── package.json
└── tsconfig.json
```

---

## Mobile Folder Description

| Folder     | Purpose                        |
| ---------- | ------------------------------ |
| assets     | Static images, icons, fonts    |
| api        | REST API clients               |
| components | Reusable UI components         |
| constants  | Application constants          |
| hooks      | Custom React hooks             |
| navigation | React Navigation configuration |
| screens    | Application screens            |
| services   | Business service wrappers      |
| store      | Global application state       |
| theme      | Colors, typography, spacing    |
| types      | TypeScript interfaces          |
| utils      | Helper functions               |

---

# Backend Structure

```text
backend/

├── prisma/
│   ├── migrations/
│   ├── schema.prisma
│   └── seed.ts
│
├── src/
│
│   ├── config/
│   │
│   ├── middleware/
│   │
│   ├── routes/
│   │
│   ├── controllers/
│   │
│   ├── services/
│   │
│   ├── repositories/
│   │
│   ├── validators/
│   │
│   ├── dto/
│   │
│   ├── enums/
│   │
│   ├── types/
│   │
│   ├── utils/
│   │
│   ├── constants/
│   │
│   ├── jobs/
│   │
│   ├── app.ts
│   └── server.ts
│
├── package.json
├── tsconfig.json
└── .env
```

---

## Backend Folder Description

| Folder       | Purpose                            |
| ------------ | ---------------------------------- |
| prisma       | Prisma schema, migrations and seed |
| config       | Application configuration          |
| middleware   | Express middleware                 |
| routes       | API endpoint definitions           |
| controllers  | HTTP request handling              |
| services     | Business logic                     |
| repositories | Prisma database access             |
| validators   | Request validation schemas         |
| dto          | Request/response DTOs              |
| enums        | Shared enums                       |
| types        | TypeScript types                   |
| utils        | Utility functions                  |
| constants    | Application constants              |
| jobs         | Background jobs and schedulers     |

---

# Layered Backend Architecture

The backend follows a layered architecture to keep responsibilities separated.

```text
HTTP Request

↓

Express Route

↓

Controller

↓

Service

↓

Repository

↓

Prisma ORM

↓

PostgreSQL
```

---

## Layer Responsibilities

### Routes

Responsible for:

- API endpoint definitions
- Middleware registration
- Request routing

Routes should not contain business logic.

---

### Controllers

Responsible for:

- Receiving requests
- Calling services
- Returning responses
- HTTP status handling

Controllers should remain thin.

---

### Services

Responsible for:

- Business rules
- Validation beyond schema validation
- Transactions
- Workflow orchestration

This layer contains the majority of the application's business logic.

---

### Repositories

Responsible for:

- Prisma queries
- CRUD operations
- Database interactions

Repositories should not contain business rules.

---

### Prisma ORM

Responsible for:

- SQL generation
- Relationships
- Migrations
- Transactions

---

### PostgreSQL

Responsible for:

- Data persistence
- Constraints
- Indexes
- Referential integrity

---

# Documentation Structure

```text
docs/

├── 01-Requirements.md
├── 02-Database-Schema.md
├── 03-API.md
├── 04-Setup.md
└── README.md
```

---

# Repository Setup

## Clone Repository

Clone the project repository using Git.

```bash
git clone <repository-url>
```

Navigate into the project directory.

```bash
cd quran-tehfeez-system
```

---

## Install Backend Dependencies

Navigate to the backend directory.

```bash
cd backend
```

Install project dependencies.

```bash
npm install
```

---

## Install Mobile Dependencies

Open a separate terminal.

Navigate to the mobile application.

```bash
cd mobile-app
```

Install all dependencies.

```bash
npm install
```

---

## Verify Installation

Ensure that both projects installed successfully.

Backend:

```bash
npm list --depth=0
```

Mobile:

```bash
npm list --depth=0
```

Any missing packages should be installed before proceeding.

---

# Initial Backend Configuration

Before running the backend, configure the environment variables.

Create the environment file.

```text
backend/

.env
```

The environment variables will be covered in detail in **Response 4**.

---

## Generate Prisma Client

Generate the Prisma client after installing dependencies.

```bash
npx prisma generate
```

This command creates the Prisma client used throughout the application.

---

## Apply Database Migrations

Run all existing database migrations.

```bash
npx prisma migrate deploy
```

During active development, developers may also use:

```bash
npx prisma migrate dev
```

---

## Seed Initial Data

Populate the database with required master data.

```bash
npm run prisma:seed
```

The seed script should create:

- Default ADMIN account
- Academic Period
- Academic Months
- Marhalas
- Initial Marhala Fee Configurations

This ensures a new developer has a usable development environment immediately after setup.

---

## Start Backend Server

Run the backend in development mode.

```bash
npm run dev
```

Expected output:

```text
Server running on http://localhost:5000

Database Connected

Prisma Client Initialized
```

---

## Verify Backend Health

Open the health endpoint.

```text
GET

http://localhost:5000/api/v1/health
```

Expected response:

```json
{
  "success": true,
  "message": "API is running.",
  "data": {
    "status": "Healthy",
    "environment": "development"
  }
}
```

---

# Development Startup Sequence

For local development, start the application in the following order:

1. PostgreSQL Database
2. Backend Server
3. Prisma Client (generated automatically if required)
4. Expo Development Server
5. Android Emulator / iOS Simulator

Starting services in this sequence helps avoid connection and initialization issues.

---

# 3. Project Structure

The project follows a modular architecture with a clear separation between the mobile application, backend services, database schema, and documentation.

This structure improves maintainability, scalability, and collaboration by allowing frontend and backend development to progress independently while sharing a common business model.

---

## High-Level Repository Structure

```text
quran-tehfeez-system/

├── mobile-app/                 # React Native (Expo)
├── backend/                    # Node.js + Express API
├── docs/                       # Project documentation
├── .gitignore
├── README.md
└── LICENSE
```

---

# Mobile Application Structure

```text
mobile-app/

├── assets/
│   ├── fonts/
│   ├── icons/
│   └── images/
│
├── src/
│
│   ├── api/
│   │   ├── auth.api.ts
│   │   ├── student.api.ts
│   │   ├── attendance.api.ts
│   │   ├── quranSession.api.ts
│   │   ├── finance.api.ts
│   │   └── report.api.ts
│   │
│   ├── components/
│   │
│   ├── constants/
│   │
│   ├── hooks/
│   │
│   ├── navigation/
│   │
│   ├── screens/
│   │   ├── auth/
│   │   ├── dashboard/
│   │   ├── students/
│   │   ├── attendance/
│   │   ├── quran/
│   │   ├── finance/
│   │   ├── reports/
│   │   └── profile/
│   │
│   ├── services/
│   │
│   ├── store/
│   │
│   ├── theme/
│   │
│   ├── types/
│   │
│   ├── utils/
│   │
│   └── App.tsx
│
├── app.json
├── package.json
└── tsconfig.json
```

---

## Mobile Folder Description

| Folder     | Purpose                        |
| ---------- | ------------------------------ |
| assets     | Static images, icons, fonts    |
| api        | REST API clients               |
| components | Reusable UI components         |
| constants  | Application constants          |
| hooks      | Custom React hooks             |
| navigation | React Navigation configuration |
| screens    | Application screens            |
| services   | Business service wrappers      |
| store      | Global application state       |
| theme      | Colors, typography, spacing    |
| types      | TypeScript interfaces          |
| utils      | Helper functions               |

---

# Backend Structure

```text
backend/

├── prisma/
│   ├── migrations/
│   ├── schema.prisma
│   └── seed.ts
│
├── src/
│
│   ├── config/
│   │
│   ├── middleware/
│   │
│   ├── routes/
│   │
│   ├── controllers/
│   │
│   ├── services/
│   │
│   ├── repositories/
│   │
│   ├── validators/
│   │
│   ├── dto/
│   │
│   ├── enums/
│   │
│   ├── types/
│   │
│   ├── utils/
│   │
│   ├── constants/
│   │
│   ├── jobs/
│   │
│   ├── app.ts
│   │
│   └── server.ts
│
├── package.json
├── tsconfig.json
└── .env
```

---

## Backend Folder Description

| Folder       | Purpose                            |
| ------------ | ---------------------------------- |
| prisma       | Prisma schema, migrations and seed |
| config       | Application configuration          |
| middleware   | Express middleware                 |
| routes       | API endpoint definitions           |
| controllers  | HTTP request handling              |
| services     | Business logic                     |
| repositories | Prisma database access             |
| validators   | Request validation schemas         |
| dto          | Request/response DTOs              |
| enums        | Shared enums                       |
| types        | TypeScript types                   |
| utils        | Utility functions                  |
| constants    | Application constants              |
| jobs         | Background jobs and schedulers     |

---

# Layered Backend Architecture

The backend follows a layered architecture to keep responsibilities separated.

```text
HTTP Request

↓

Express Route

↓

Controller

↓

Service

↓

Repository

↓

Prisma ORM

↓

PostgreSQL
```

---

## Layer Responsibilities

### Routes

Responsible for:

- API endpoint definitions
- Middleware registration
- Request routing

Routes should not contain business logic.

---

### Controllers

Responsible for:

- Receiving requests
- Calling services
- Returning responses
- HTTP status handling

Controllers should remain thin.

---

### Services

Responsible for:

- Business rules
- Validation beyond schema validation
- Transactions
- Workflow orchestration

This layer contains the majority of the application's business logic.

---

### Repositories

Responsible for:

- Prisma queries
- CRUD operations
- Database interactions

Repositories should not contain business rules.

---

### Prisma ORM

Responsible for:

- SQL generation
- Relationships
- Migrations
- Transactions

---

### PostgreSQL

Responsible for:

- Data persistence
- Constraints
- Indexes
- Referential integrity

---

# 4. Mobile Application Setup

## Install Dependencies

Navigate to the mobile application directory.

```bash
cd mobile-app
```

Install all required packages.

```bash
npm install
```

Verify that the installation completed successfully.

```bash
npm list --depth=0
```

---

## Expo Configuration

The mobile application uses **Expo** as the development framework.

Verify Expo installation.

```bash
expo --version
```

If Expo is not installed globally:

```bash
npm install -g expo
```

---

## Start Expo Development Server

Run the Expo development server.

```bash
npm start
```

or

```bash
npx expo start
```

This launches the Expo Developer Tools.

---

## Running on Android

Start the Android Emulator from Android Studio.

Then run:

```bash
npm run android
```

or

```bash
npx expo run:android
```

---

## Running on iOS (macOS)

Launch the iOS Simulator.

Run:

```bash
npm run ios
```

or

```bash
npx expo run:ios
```

---

## Running on Physical Device

Install the **Expo Go** application.

Start Expo:

```bash
npx expo start
```

Scan the displayed QR code using:

- Android (Expo Go)
- iPhone Camera / Expo Go

---

# Mobile Environment Configuration

Create the environment file.

```text
mobile-app/

.env
```

Example:

```env
EXPO_PUBLIC_API_BASE_URL=http://localhost:5000/api/v1
```

For Android Emulator:

```env
EXPO_PUBLIC_API_BASE_URL=http://10.0.2.2:5000/api/v1
```

For physical devices, replace localhost with the development machine's LAN IP.

Example:

```env
EXPO_PUBLIC_API_BASE_URL=http://192.168.1.100:5000/api/v1
```

---

## Authentication Storage

JWT tokens should be stored securely.

Recommended storage:

- Expo Secure Store

Store:

- Access Token
- Refresh Token

Do not store:

- Password
- Password Hash

---

# 5. Database Setup

The application uses PostgreSQL with Prisma ORM.

---

## Create Database

Using PostgreSQL:

```sql
CREATE DATABASE quran_tehfeez;
```

Verify:

```sql
\l
```

---

## Configure Database Connection

Backend `.env`

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/quran_tehfeez"
```

---

## Generate Prisma Client

After configuring the database:

```bash
npx prisma generate
```

---

## Apply Database Migrations

Development:

```bash
npx prisma migrate dev
```

Production:

```bash
npx prisma migrate deploy
```

---

## Seed Initial Data

Populate required master data.

```bash
npm run prisma:seed
```

Seed should create:

- Default ADMIN user
- Academic Period
- Academic Months
- Marhalas
- Marhala Fee Configurations

---

## View Database

Open Prisma Studio.

```bash
npx prisma studio
```

Default URL:

```text
http://localhost:5555
```

---

## Reset Database

Development only.

```bash
npx prisma migrate reset
```

This command:

- Drops the database
- Recreates schema
- Runs migrations
- Executes seed script

---

# 6. Prisma Development Workflow

The recommended workflow during development is:

```text
Update schema.prisma

↓

Create Migration

↓

Apply Migration

↓

Generate Prisma Client

↓

Update Repository Layer

↓

Update Services

↓

Update APIs

↓

Update Mobile Application
```

---

## Migration Commands

Create migration:

```bash
npx prisma migrate dev --name <migration_name>
```

Deploy migrations:

```bash
npx prisma migrate deploy
```

Generate Prisma Client:

```bash
npx prisma generate
```

Open Prisma Studio:

```bash
npx prisma studio
```

Validate schema:

```bash
npx prisma validate
```

Format schema:

```bash
npx prisma format
```

---

## Database Change Guidelines

Follow these principles when modifying the schema:

- Never modify historical financial records.
- Prefer additive migrations over destructive changes.
- Use Prisma migrations for all schema changes.
- Do not edit applied migration files.
- Always test migrations on a development database before production deployment.

---

# Local Development Workflow

For daily development, start services in the following order:

1. PostgreSQL Database
2. Backend Server
3. Prisma Studio (optional)
4. Expo Development Server
5. Android Emulator / iOS Simulator / Physical Device

This startup sequence minimizes connection and initialization issues between components.

---

# Verification Checklist

Before beginning development, confirm:

- ✅ PostgreSQL database created
- ✅ Database connection configured
- ✅ Prisma Client generated
- ✅ Database migrations applied
- ✅ Seed data loaded
- ✅ Backend server running
- ✅ Expo development server running
- ✅ Mobile application connects successfully to backend APIs
- ✅ Login works using seeded ADMIN credentials

---

# 8. Environment Variables

The application uses environment variables to separate configuration from source code.

Environment-specific values such as database credentials, API secrets, and third-party service keys must never be hardcoded.

Separate environment files should be maintained for development, staging, and production.

---

# Backend Environment Variables

Create the following file:

```text
backend/

.env
```

Example configuration:

```env
# --------------------------------------------------
# Application
# --------------------------------------------------

NODE_ENV=development
PORT=5000
APP_NAME=Quran Tehfeez Management System
API_PREFIX=/api/v1

# --------------------------------------------------
# Database
# --------------------------------------------------

DATABASE_URL="postgresql://postgres:password@localhost:5432/quran_tehfeez"

# --------------------------------------------------
# JWT
# --------------------------------------------------

JWT_ACCESS_SECRET=replace_with_secure_access_secret
JWT_REFRESH_SECRET=replace_with_secure_refresh_secret

JWT_ACCESS_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=30d

# --------------------------------------------------
# BCrypt
# --------------------------------------------------

BCRYPT_SALT_ROUNDS=12

# --------------------------------------------------
# Cloudinary
# --------------------------------------------------

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# --------------------------------------------------
# CORS
# --------------------------------------------------

CORS_ORIGIN=*

# --------------------------------------------------
# Logging
# --------------------------------------------------

LOG_LEVEL=debug
```

---

## Environment Variable Description

| Variable               | Purpose                         |
| ---------------------- | ------------------------------- |
| NODE_ENV               | Current application environment |
| PORT                   | Backend server port             |
| DATABASE_URL           | PostgreSQL connection string    |
| JWT_ACCESS_SECRET      | Access Token signing key        |
| JWT_REFRESH_SECRET     | Refresh Token signing key       |
| JWT_ACCESS_EXPIRES_IN  | Access Token validity           |
| JWT_REFRESH_EXPIRES_IN | Refresh Token validity          |
| BCRYPT_SALT_ROUNDS     | Password hashing strength       |
| CLOUDINARY\_\*         | Cloudinary configuration        |
| CORS_ORIGIN            | Allowed origins                 |
| LOG_LEVEL              | Logging verbosity               |

---

## Environment Security Guidelines

Never commit:

- `.env`
- `.env.local`
- `.env.production`

Ensure these files are included in `.gitignore`.

Secrets should be provided through deployment platform environment variables in production.

---

# Mobile Environment Variables

Create:

```text
mobile-app/

.env
```

Example:

```env
EXPO_PUBLIC_API_BASE_URL=http://localhost:5000/api/v1
```

---

## Android Emulator

Use:

```env
EXPO_PUBLIC_API_BASE_URL=http://10.0.2.2:5000/api/v1
```

---

## Physical Device

Use the development machine's local IP.

Example:

```env
EXPO_PUBLIC_API_BASE_URL=http://192.168.1.100:5000/api/v1
```

---

## Production

```env
EXPO_PUBLIC_API_BASE_URL=https://api.qurantehfeez.com/api/v1
```

---

## Mobile Environment Rules

Only variables prefixed with:

```text
EXPO_PUBLIC_
```

are accessible within the Expo application.

Sensitive values such as JWT secrets or Cloudinary API secrets must never be exposed to the mobile application.

---

# JWT Configuration

The backend uses JSON Web Tokens for authentication.

---

## Access Token

Purpose:

- Authenticate API requests

Recommended expiration:

```text
1 Hour
```

---

## Refresh Token

Purpose:

- Issue new Access Tokens

Recommended expiration:

```text
30 Days
```

---

## Token Flow

```text
Login

↓

Access Token

+

Refresh Token

↓

Access Token Expires

↓

Refresh Token API

↓

New Access Token

↓

Continue Session
```

---

## Security Recommendations

- Generate long, cryptographically secure secrets.
- Use different secrets for Access and Refresh Tokens.
- Rotate secrets when necessary.
- Revoke Refresh Tokens on logout or password change.
- Store tokens securely on the mobile device using Expo Secure Store.

---

# Cloudinary Configuration

Cloudinary is used for storing uploaded images.

Supported uploads include:

- Student Photos
- User Profile Images
- Future Document Attachments

---

## Required Credentials

- Cloud Name
- API Key
- API Secret

---

## Upload Flow

```text
Mobile Application

↓

Backend API

↓

Cloudinary

↓

Image URL Returned

↓

Store URL in PostgreSQL
```

---

## File Validation

Supported formats:

- JPG
- JPEG
- PNG
- WEBP

Maximum size:

```text
5 MB
```

The backend should validate file type and size before uploading.

---

# Build Configuration

Separate configurations should be maintained for each environment.

| Environment | Purpose           |
| ----------- | ----------------- |
| Development | Local development |
| Staging     | QA and testing    |
| Production  | Live deployment   |

---

## Backend Build

Compile the backend:

```bash
npm run build
```

Start production server:

```bash
npm run start
```

---

## Mobile Build (Expo)

Development:

```bash
npx expo start
```

Android development build:

```bash
npx expo run:android
```

iOS development build:

```bash
npx expo run:ios
```

Production Android build:

```bash
eas build --platform android
```

Production iOS build:

```bash
eas build --platform ios
```

---

# Deployment

## Backend Deployment (Render)

Deployment steps:

1. Connect Git repository.
2. Configure environment variables.
3. Set build command:

```bash
npm install && npm run build
```

4. Set start command:

```bash
npm run start
```

5. Attach PostgreSQL database.
6. Configure Cloudinary credentials.
7. Deploy application.

---

## Database Deployment (Neon PostgreSQL)

Deployment steps:

1. Create PostgreSQL instance.
2. Copy connection string.
3. Update:

```env
DATABASE_URL
```

4. Run production migrations:

```bash
npx prisma migrate deploy
```

---

## Mobile Deployment

### Android

Use Expo EAS Build:

```bash
eas build --platform android
```

Publish to:

- Google Play Console

---

### iOS

Use Expo EAS Build:

```bash
eas build --platform ios
```

Publish through:

- App Store Connect

---

# Environment Switching

Each environment should maintain its own configuration.

| Environment | Backend            | Mobile             |
| ----------- | ------------------ | ------------------ |
| Development | Local `.env`       | Local `.env`       |
| Staging     | Platform variables | Staging API URL    |
| Production  | Platform variables | Production API URL |

No code changes should be required when switching environments.

---

# Deployment Checklist

Before deploying, verify:

- ✅ Production environment variables configured
- ✅ PostgreSQL database available
- ✅ Prisma migrations applied
- ✅ Seed data executed (if required)
- ✅ JWT secrets configured
- ✅ Cloudinary credentials configured
- ✅ API health endpoint responding
- ✅ Mobile application points to production API
- ✅ HTTPS enabled
- ✅ CORS configured appropriately
- ✅ Logging level set for production

---

# 10. Development Workflow

This section defines the recommended development practices for maintaining a consistent, high-quality, and scalable codebase. Following these guidelines ensures that all contributors work in a predictable manner and minimizes integration issues.

---

# Git Branch Strategy

The project follows a simplified Git branching model.

```text
main
│
├── develop
│
├── feature/authentication
├── feature/student-management
├── feature/quran-sessions
├── feature/attendance
├── feature/finance
├── feature/dashboard
│
├── bugfix/login-validation
├── bugfix/attendance-filter
│
└── hotfix/critical-production-fix
```

---

## Branch Purpose

| Branch     | Purpose                                   |
| ---------- | ----------------------------------------- |
| main       | Production-ready code                     |
| develop    | Integration branch for completed features |
| feature/\* | New features                              |
| bugfix/\*  | Non-production bug fixes                  |
| hotfix/\*  | Critical production fixes                 |

---

## Development Flow

```text
Create Feature Branch

↓

Develop Feature

↓

Commit Changes

↓

Push Branch

↓

Create Pull Request

↓

Code Review

↓

Merge into develop

↓

Release Testing

↓

Merge into main
```

---

# Git Commit Convention

Use meaningful commit messages following a consistent format.

Recommended format:

```text
<type>: <short description>
```

---

## Commit Types

| Type     | Purpose                 |
| -------- | ----------------------- |
| feat     | New feature             |
| fix      | Bug fix                 |
| refactor | Code improvement        |
| docs     | Documentation           |
| style    | Formatting only         |
| test     | Testing                 |
| chore    | Maintenance             |
| perf     | Performance improvement |

---

## Examples

```text
feat: add student attendance module

feat: implement JWT authentication

fix: resolve settlement calculation bug

refactor: simplify attendance service

docs: update API documentation

test: add authentication unit tests

chore: update dependencies
```

---

# Pull Request Guidelines

Every Pull Request should include:

- Summary of changes
- Related issue/task
- Testing performed
- Screenshots (for UI changes)
- Migration details (if applicable)

---

## Pull Request Checklist

Before requesting a review:

- Code builds successfully.
- Linting passes.
- Tests pass.
- No debug statements remain.
- Documentation updated if required.
- Database migration included (if schema changed).

---

# Coding Standards

The project follows consistent coding standards across both backend and mobile applications.

---

## General Principles

- Write readable code.
- Prefer clarity over cleverness.
- Keep functions focused on a single responsibility.
- Avoid duplicated logic.
- Follow consistent naming conventions.
- Use TypeScript strict mode.

---

## Naming Conventions

### Variables

```typescript
studentName;
attendanceDate;
monthlySettlement;
```

---

### Constants

```typescript
MAX_FILE_SIZE;
JWT_EXPIRY;
DEFAULT_PAGE_SIZE;
```

---

### Classes

```typescript
StudentService;

AttendanceController;

SettlementRepository;
```

---

### Interfaces

```typescript
StudentDto;

LoginRequest;

AttendanceResponse;
```

---

### Files

```text
student.service.ts

student.controller.ts

student.repository.ts

attendance.validator.ts
```

---

# Backend Coding Guidelines

---

## Controllers

Controllers should:

- Receive HTTP requests
- Validate request input
- Call Services
- Return standardized responses

Controllers should not contain business logic.

Example:

```text
Request

↓

Controller

↓

Service

↓

Response
```

---

## Services

Services contain:

- Business Rules
- Calculations
- Transactions
- Workflow orchestration

Services should never return raw database objects directly.

---

## Repositories

Repositories:

- Perform Prisma operations
- Execute database queries
- Handle persistence only

Repositories should never contain business rules.

---

## Validation

Every API request must be validated before reaching the service layer.

Validation includes:

- Required fields
- Data types
- Enum validation
- UUID validation
- Date validation
- Business constraints where applicable

---

# Mobile Coding Guidelines

---

## Screens

Each screen should:

- Manage UI state
- Call Services/API
- Handle navigation
- Display data

Business logic should remain outside screens.

---

## Components

Reusable UI belongs in the `components` directory.

Examples:

- Student Card
- Attendance Tile
- Fee Summary Card
- Dashboard Statistic Card
- Loading Indicator

---

## Services

Services wrap API calls.

Example:

```typescript
StudentService;

AttendanceService;

FinanceService;

AuthService;
```

Screens should interact with Services rather than directly invoking HTTP clients.

---

## State Management

Keep global state minimal.

Recommended global state:

- Logged-in user
- Authentication tokens
- Selected Academic Month
- Theme settings

Feature-specific state should remain local to the relevant screen whenever possible.

---

# Database Migration Workflow

Schema changes must always be managed through Prisma Migrations.

---

## Migration Process

```text
Update schema.prisma

↓

Validate Schema

↓

Create Migration

↓

Review SQL

↓

Run Migration

↓

Generate Prisma Client

↓

Update Repository Layer

↓

Update Services

↓

Update APIs

↓

Update Mobile App
```

---

## Commands

Validate schema:

```bash
npx prisma validate
```

Create migration:

```bash
npx prisma migrate dev --name add_student_notes
```

Generate Prisma Client:

```bash
npx prisma generate
```

Deploy migrations:

```bash
npx prisma migrate deploy
```

---

## Migration Rules

- Never modify existing migration files.
- Every schema change must have a migration.
- Test migrations on development before production.
- Avoid destructive migrations whenever possible.
- Back up production data before major schema changes.

---

# API Development Workflow

The backend should follow a consistent implementation sequence for every feature.

```text
Database Schema

↓

Repository

↓

Service

↓

Controller

↓

Route

↓

Validation

↓

Swagger (Future)

↓

Postman Testing

↓

Mobile Integration
```

---

## API Development Checklist

Before marking an API complete:

- Endpoint implemented.
- Validation completed.
- Authorization enforced.
- Business rules implemented.
- Standard response format used.
- Error handling implemented.
- Tested via Postman.
- Mobile integration verified.

---

# Testing Strategy

Testing should occur at multiple levels to ensure application quality.

---

## Unit Testing

Focus:

- Services
- Utility functions
- Business calculations
- Validation logic

Examples:

- Settlement calculation
- Attendance percentage
- Fee status derivation

---

## Integration Testing

Verify interaction between:

- Routes
- Controllers
- Services
- Prisma
- Database

Examples:

- Login flow
- Student creation
- Settlement generation
- Fee payment workflow

---

## Manual Testing

Verify complete user workflows:

- User authentication
- Student management
- Attendance
- Quran sessions
- Fee collection
- Settlement
- Dashboard
- Reports

---

## Regression Testing

Before every release, verify:

- Authentication
- CRUD operations
- Financial calculations
- Dashboard
- Reports
- File uploads

---

# Code Review Guidelines

Every Pull Request should be reviewed before merging.

---

## Review Checklist

Reviewers should verify:

- Business rules implemented correctly.
- Code readability.
- Naming consistency.
- Error handling.
- Security practices.
- Performance considerations.
- Documentation updates.
- Test coverage.

---

## Common Review Questions

- Is the code easy to understand?
- Does it follow project architecture?
- Is validation complete?
- Are authorization checks enforced?
- Are edge cases handled?
- Can the logic be simplified?
- Are historical records preserved?
- Does it respect Academic Month lock rules?

---

# Development Best Practices

- Keep commits focused on a single concern.
- Prefer composition over duplication.
- Never hardcode secrets.
- Use environment variables for configuration.
- Write self-explanatory code.
- Preserve historical business data.
- Keep controllers thin and services cohesive.
- Use transactions for multi-step financial operations.
- Document architectural decisions that affect future development.

---

# Development Workflow Checklist

Before completing a feature:

- ✅ Feature branch created
- ✅ Code follows naming conventions
- ✅ Validation implemented
- ✅ Business rules implemented
- ✅ Database migration added (if required)
- ✅ Prisma Client regenerated
- ✅ API tested
- ✅ Mobile integration tested
- ✅ Unit/Integration tests updated
- ✅ Documentation updated
- ✅ Pull Request created

---

# 11. Troubleshooting Guide

This section documents the most common issues developers may encounter while setting up, running, or deploying the Quran Tehfeez Management System, along with recommended solutions.

---

# Backend Issues

## Node Modules Not Installed

### Symptoms

```text
Cannot find module 'express'

Cannot find module '@prisma/client'
```

### Solution

Delete existing dependencies and reinstall:

```bash
rm -rf node_modules package-lock.json

npm install
```

---

## Port Already in Use

### Symptoms

```text
Error: listen EADDRINUSE: address already in use :::5000
```

### Solution

Identify the process using the port.

Linux / macOS

```bash
lsof -i :5000
```

Windows

```bash
netstat -ano | findstr :5000
```

Terminate the process or configure a different port in `.env`.

---

## Environment Variables Not Loaded

### Symptoms

```text
DATABASE_URL is missing

JWT_ACCESS_SECRET is undefined
```

### Solution

Verify:

- `.env` exists.
- `dotenv` is initialized before configuration is accessed.
- Variable names match exactly.
- Restart the backend after modifying `.env`.

---

# Prisma Issues

## Prisma Client Outdated

### Symptoms

```text
Property does not exist on type PrismaClient
```

### Solution

Regenerate the Prisma Client.

```bash
npx prisma generate
```

---

## Migration Failed

### Symptoms

```text
Migration failed to apply.
```

### Solution

Check migration status.

```bash
npx prisma migrate status
```

Development environment:

```bash
npx prisma migrate reset
```

Production:

- Never reset the database.
- Resolve the migration issue.
- Re-run:

```bash
npx prisma migrate deploy
```

---

## Database Connection Failed

### Symptoms

```text
P1001

Can't reach database server.
```

### Solution

Verify:

- PostgreSQL is running.
- `DATABASE_URL` is correct.
- Database exists.
- Network/firewall allows connections.

---

# PostgreSQL Issues

## Database Does Not Exist

### Symptoms

```text
database "quran_tehfeez" does not exist
```

### Solution

Create the database.

```sql
CREATE DATABASE quran_tehfeez;
```

Apply migrations.

```bash
npx prisma migrate dev
```

---

## Authentication Failed

### Symptoms

```text
password authentication failed
```

### Solution

Verify:

- Username
- Password
- Port
- Host

Update `DATABASE_URL` if required.

---

# Mobile Application Issues

## Expo Server Not Starting

### Symptoms

```text
Metro Bundler failed
```

### Solution

Clear Expo cache.

```bash
npx expo start --clear
```

---

## Android Emulator Cannot Reach Backend

### Symptoms

API requests fail.

### Solution

Android Emulator cannot use `localhost`.

Use:

```text
http://10.0.2.2:5000/api/v1
```

---

## Physical Device Cannot Connect

### Symptoms

Network request failed.

### Solution

Use the development machine's LAN IP.

Example:

```text
http://192.168.1.100:5000/api/v1
```

Ensure:

- Backend is running.
- Both devices are on the same network.
- Firewall allows inbound connections.

---

## Build Errors

### Symptoms

Native build fails.

### Solution

Clean the project.

```bash
npm install

npx expo doctor

npx expo start --clear
```

Resolve dependency version conflicts before retrying.

---

# JWT Issues

## Invalid Token

### Symptoms

```text
401 Unauthorized
```

### Solution

Verify:

- Token exists.
- Authorization header format:

```text
Bearer <access_token>
```

- Token is not expired.
- JWT secret matches the signing secret.

---

## Refresh Token Fails

### Symptoms

```text
Invalid Refresh Token
```

### Solution

Check:

- Refresh Token expiration.
- Refresh Token storage.
- Logout behavior.
- Secret consistency.

---

# Cloudinary Issues

## Upload Failed

### Symptoms

```text
Cloudinary Authentication Error
```

### Solution

Verify:

- Cloud Name
- API Key
- API Secret

Confirm all credentials are configured correctly in the backend environment variables.

---

## File Too Large

### Symptoms

```text
413 Payload Too Large
```

### Solution

Reduce image size or increase the configured upload limit if appropriate.

---

# Network Issues

## CORS Error

### Symptoms

```text
Blocked by CORS policy
```

### Solution

Update backend CORS configuration.

Development:

```text
CORS_ORIGIN=*
```

Production:

Use specific allowed origins instead of a wildcard.

---

## API Timeout

### Symptoms

Requests remain pending.

### Solution

Verify:

- Backend server is running.
- PostgreSQL is available.
- Network connectivity.
- API URL is correct.

---

# Useful Commands

## Backend

Install dependencies:

```bash
npm install
```

Run development server:

```bash
npm run dev
```

Build:

```bash
npm run build
```

Start production server:

```bash
npm run start
```

---

## Prisma

Generate Client:

```bash
npx prisma generate
```

Create migration:

```bash
npx prisma migrate dev --name <migration_name>
```

Deploy migrations:

```bash
npx prisma migrate deploy
```

Reset database:

```bash
npx prisma migrate reset
```

Validate schema:

```bash
npx prisma validate
```

Format schema:

```bash
npx prisma format
```

Open Prisma Studio:

```bash
npx prisma studio
```

---

## Expo

Start:

```bash
npx expo start
```

Clear cache:

```bash
npx expo start --clear
```

Android:

```bash
npx expo run:android
```

iOS:

```bash
npx expo run:ios
```

---

## Git

Clone repository:

```bash
git clone <repository-url>
```

Check status:

```bash
git status
```

Create branch:

```bash
git checkout -b feature/<feature-name>
```

Pull latest changes:

```bash
git pull origin develop
```

Push changes:

```bash
git push origin feature/<feature-name>
```

---

# Recommended Project Scripts

## Backend (`package.json`)

```json
{
  "scripts": {
    "dev": "tsx watch src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "lint": "eslint .",
    "format": "prettier --write .",
    "test": "vitest",
    "prisma:generate": "prisma generate",
    "prisma:migrate": "prisma migrate dev",
    "prisma:deploy": "prisma migrate deploy",
    "prisma:seed": "tsx prisma/seed.ts",
    "prisma:studio": "prisma studio"
  }
}
```

---

## Mobile (`package.json`)

```json
{
  "scripts": {
    "start": "expo start",
    "android": "expo run:android",
    "ios": "expo run:ios",
    "web": "expo start --web",
    "lint": "eslint .",
    "format": "prettier --write .",
    "test": "jest"
  }
}
```

---

# External References

## Official Documentation

| Technology       | Documentation                        |
| ---------------- | ------------------------------------ |
| React Native     | https://reactnative.dev              |
| Expo             | https://docs.expo.dev                |
| Express.js       | https://expressjs.com                |
| Prisma ORM       | https://www.prisma.io/docs           |
| PostgreSQL       | https://www.postgresql.org/docs      |
| Cloudinary       | https://cloudinary.com/documentation |
| JWT              | https://jwt.io                       |
| React Navigation | https://reactnavigation.org          |

---

# Version History

| Version | Date      | Description                                             |
| ------- | --------- | ------------------------------------------------------- |
| 1.0     | July 2026 | Initial project documentation and developer setup guide |

---

# Final Developer Setup Checklist

A new developer should complete the following steps before starting feature development.

## System Setup

- ✅ Install Node.js (LTS)
- ✅ Install Git
- ✅ Install PostgreSQL
- ✅ Install Android Studio
- ✅ Install Expo CLI
- ✅ Install Visual Studio Code
- ✅ Create a Cloudinary account

---

## Repository Setup

- ✅ Clone repository
- ✅ Install backend dependencies
- ✅ Install mobile dependencies
- ✅ Configure backend `.env`
- ✅ Configure mobile `.env`

---

## Database Setup

- ✅ Create PostgreSQL database
- ✅ Generate Prisma Client
- ✅ Apply database migrations
- ✅ Seed initial data
- ✅ Verify database using Prisma Studio

---

## Application Verification

- ✅ Backend server starts successfully
- ✅ Health endpoint responds
- ✅ Expo development server starts
- ✅ Mobile app connects to backend
- ✅ Seeded ADMIN user can log in
- ✅ API requests succeed
- ✅ Image upload works
- ✅ Dashboard loads correctly
