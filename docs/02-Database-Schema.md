# Quran Tehfeez Management System

## Database Schema Design

Version : 1.0

Database : PostgreSQL

ORM : Prisma

Architecture : Relational Database

Application : React Native + Node.js

---

# 1. Design Principles

The database is designed using a relational architecture with a strong emphasis on data integrity, scalability, auditability, and future extensibility.

Every design decision follows the principle that operational data should never be overwritten. Instead, historical information shall always be preserved through transactional records.

The database is intended to serve as the single source of truth for:

- Mobile Application
- Backend APIs
- Reports & Dashboards
- Monthly Settlement Calculation
- Future Analytics

---

## 1.1 Core Design Principles

### Historical Data Preservation

Business data shall never be overwritten.

Examples

- Student Attendance
- Huffaz Attendance
- Quran Sessions
- Student Fee Collection
- Monthly Settlement

Every event creates a new record instead of updating historical information.

---

### Normalized Database Design

The schema follows normalization principles to reduce redundancy and improve maintainability.

Examples

Instead of storing

Student

- July Fee
- August Fee
- September Fee

The database stores

Student

↓

StudentFeeCollection

↓

FeePaymentTransaction

which supports unlimited academic months.

---

### Business Driven Design

The schema reflects actual institute operations instead of technical shortcuts.

Examples

Student

↓

Daily Quran Session

↓

Huffaz

instead of permanently assigning a Huffaz to a student.

---

### Audit First

Every important transaction is auditable.

The database records

- Created By
- Updated By
- Deleted By
- Created Date
- Updated Date
- Deleted Date

This ensures complete accountability.

---

### Soft Delete Strategy

Operational records shall never be physically deleted.

Instead

- isActive
- deletedAt
- deletedBy

shall be used.

This preserves historical reports.

---

### Monthly Financial Integrity

Every financial calculation belongs to one Academic Month.

Once a Monthly Settlement is locked,

- Attendance
- Fee Collection
- Quran Sessions
- Settlement

cannot be modified.

---

### Configurable Business Rules

Business rules shall be configurable whenever possible.

Examples

- Marhala Fee
- Half Day Percentage
- Future Attendance Rules

instead of hardcoded values.

---

# 2. Database Overview

The database is divided into logical business modules.

This separation keeps the application modular and easier to maintain.

---

## Authentication Module

Responsible for

- Login
- User Management
- Roles
- Authentication

Entities

- User

---

## Academic Module

Responsible for

- Academic Months
- Marhala
- Fee Configuration

Entities

- AcademicMonth
- Marhala
- MarhalaFeeConfiguration

---

## Student Module

Responsible for

- Student Information
- Attendance
- Quran Journey
- Notes
- Promotions

Entities

- Student
- StudentAttendance
- QuranSession
- StudentNote
- MarhalaHistory

---

## Huffaz Module

Responsible for

- Huffaz Attendance

Entities

- HuffazAttendance

(Huffaz information is maintained through the User entity.)

---

## Finance Module

Responsible for

- Student Fee Collection
- Payment Transactions
- Monthly Settlement
- Settlement Details
- Manual Adjustments

Entities

- StudentFeeCollection
- FeePaymentTransaction
- MonthlySettlement
- MonthlySettlementDetail
- SettlementAdjustment

---

## System Module

Responsible for

- Audit Logs
- File References
- Future System Configuration

Entities

- AuditLog
- Media

---

# 3. Naming Conventions

The project follows consistent naming conventions across PostgreSQL, Prisma, Backend APIs, and React Native.

---

## Table Names

Singular PascalCase

Examples

User

Student

QuranSession

StudentAttendance

MonthlySettlement

---

## Column Names

camelCase

Examples

createdAt

updatedAt

studentId

academicMonthId

receivedAmount

paymentStatus

---

## Primary Keys

Every table uses

id UUID

Example

id

---

## Foreign Keys

Every relationship follows

<Entity>Name + Id

Examples

studentId

userId

academicMonthId

marhalaId

settlementId

---

## Timestamp Columns

createdAt

updatedAt

deletedAt

---

## User Audit Columns

createdBy

updatedBy

deletedBy

---

## Boolean Naming

Every boolean begins with

is

Examples

isActive

isLocked

isDeleted

---

## Enum Naming

PascalCase

Examples

AttendanceStatus

SettlementStatus

PaymentStatus

StudentStatus

---

## Index Naming

idx*<table>*<column>

Examples

idx_student_itsNumber

idx_studentAttendance_date

idx_quranSession_student

---

## Unique Constraint Naming

uk*<table>*<column>

Example

uk_student_itsNumber

---

# 4. Enumerations

The following enums are used throughout the application.

---

## UserRole

ADMIN

HUFFAZ

---

## Gender

MALE

FEMALE

---

## AttendanceStatus

PRESENT

HALF_DAY

LEAVE

ABSENT

UZUR

---

## StudentStatus

ACTIVE

ON_LEAVE

COMPLETED

SHIFTED

DISCONTINUED

---

## PaymentStatus

PAID

PARTIAL_PAID

UNPAID

WAIVED

DISCOUNTED

---

## SessionType

HIFZ

MURAJAAH

MIXED

---

## SettlementStatus

DRAFT

GENERATED

LOCKED

---

## MarhalaCode

ULA

SANIYAH

SALESAH

RABEAH

KHAMESAH

SADESAH

---

# 5. Domain Model

The following represents the complete business domain for Phase 1.

Authentication

└── User

Academic

├── AcademicPeriod
├── AcademicMonth
├── Marhala
└── MarhalaFeeConfiguration

Student

├── Student
├── StudentAttendance
├── QuranSession
├── StudentNote
└── MarhalaHistory

Finance

├── StudentFeeCollection
├── FeePaymentTransaction
├── MonthlySettlement
├── MonthlySettlementDetail
└── SettlementAdjustment

System

├── AuditLog
└── Media

---

## Domain Flow

Academic Month

│

├──────── Student Attendance

├──────── Huffaz Attendance

├──────── Quran Sessions

├──────── Student Fee Collection

│ │

│ └──────── Fee Payment Transactions

│

└──────── Monthly Settlement

          │

          ├──────── Monthly Settlement Details

          └──────── Settlement Adjustments

This domain model becomes the foundation for the relational schema that follows in the next sections.

# 6. Entity Relationships (ER)

This section defines how every business entity is related to one another.

The relationships described here become the blueprint for:

- PostgreSQL Foreign Keys
- Prisma Relations
- Backend APIs
- Mobile Screens
- Reports
- Dashboard Queries

---

# 6.1 High Level Entity Relationship Diagram

                               User
                                 │
          ┌──────────────────────┼──────────────────────┐
          │                      │                      │
          │                      │                      │
          ▼                      ▼                      ▼

HuffazAttendance QuranSession Audit Records

                                 ▲
                                 │
                                 │
                              Student
                                 │
      ┌───────────────┬──────────┼───────────────┐
      │               │          │               │
      ▼               ▼          ▼               ▼

Attendance Notes MarhalaHistory Fee Collection
│
▼
Fee Payment Transactions

AcademicPeriod

        │

        ▼

AcademicMonth

        │

        ├──────── StudentAttendance

        ├──────── HuffazAttendance

        ├──────── QuranSession

        ├──────── StudentFeeCollection

        └──────── MonthlySettlement

                     │

                     ▼

          Monthly Settlement Detail

                     │

                     ▼

          Settlement Adjustment

---

# 6.2 Relationship Matrix

| Parent Entity           | Child Entity            | Relationship |
| ----------------------- | ----------------------- | ------------ |
| User                    | HuffazAttendance        | One to Many  |
| User                    | QuranSession            | One to Many  |
| AcademicMonth           | StudentAttendance       | One to Many  |
| AcademicMonth           | HuffazAttendance        | One to Many  |
| AcademicMonth           | QuranSession            | One to Many  |
| AcademicMonth           | StudentFeeCollection    | One to Many  |
| AcademicMonth           | MonthlySettlement       | One to One   |
| Marhala                 | Student                 | One to Many  |
| Marhala                 | MarhalaFeeConfiguration | One to Many  |
| Student                 | StudentAttendance       | One to Many  |
| Student                 | QuranSession            | One to Many  |
| Student                 | StudentNote             | One to Many  |
| Student                 | MarhalaHistory          | One to Many  |
| Student                 | StudentFeeCollection    | One to Many  |
| StudentFeeCollection    | FeePaymentTransaction   | One to Many  |
| MonthlySettlement       | MonthlySettlementDetail | One to Many  |
| MonthlySettlementDetail | SettlementAdjustment    | One to Many  |

---

# 6.3 Module Relationship Flow

The application is divided into independent business modules that communicate through well-defined relationships.

Authentication

↓

User

↓

Academic

↓

Student Management

↓

Attendance

↓

Quran Session

↓

Finance

↓

Monthly Settlement

↓

Reports & Dashboard

Each module depends only on the module immediately above it.

This keeps the architecture modular and maintainable.

---

# 6.4 Student Module Relationships

Student

│

├──────── StudentAttendance

├──────── QuranSession

├──────── StudentNote

├──────── MarhalaHistory

└──────── StudentFeeCollection

A student is the central entity of the academic module.

No business data is stored directly on the Student record.

Instead, operational data is recorded through transactional child tables.

Benefits

- Complete history
- Better reporting
- No data loss
- Easy analytics

---

# 6.5 Quran Session Relationship

User (HUFFAZ)

        │

        ▼

QuranSession

        ▲

        │

     Student

One Huffaz

↓

Conducts many Quran Sessions

One Student

↓

Has many Quran Sessions

This relationship intentionally avoids permanently assigning students to Huffaz.

Instead, every Quran Session records which Huffaz taught that student during that session.

This reflects the institute's operational workflow.

---

# 6.6 Attendance Relationships

Student Attendance

AcademicMonth

        │

        ▼

StudentAttendance

        ▲

        │

     Student

Huffaz Attendance

AcademicMonth

        │

        ▼

HuffazAttendance

        ▲

        │

     User(HUFFAZ)

Attendance belongs to both

- Academic Month
- Person

This allows month-wise reporting.

---

# 6.7 Finance Relationships

Student

│

▼

StudentFeeCollection

│

▼

FeePaymentTransaction

Monthly fee collection acts as the monthly summary.

Individual payments are stored separately.

Benefits

- Multiple installments

- Payment history

- Future receipt generation

- Refund support

- Accurate audit trail

---

# 6.8 Monthly Settlement Relationships

AcademicMonth

        │

        ▼

MonthlySettlement

        │

        ▼

MonthlySettlementDetail

        │

        ▼

SettlementAdjustment

MonthlySettlement

stores

- Collection Summary
- Working Days
- Daily Pool
- Settlement Status

MonthlySettlementDetail

stores

one record per Huffaz.

SettlementAdjustment

stores

- Bonus
- Deduction
- Remarks

This keeps calculations transparent and fully auditable.

---

# 6.9 Academic Month Ownership

AcademicMonth

│

├──────── Student Attendance

├──────── Huffaz Attendance

├──────── Quran Session

├──────── Student Fee Collection

├──────── Monthly Settlement

└──────── Reports

Every operational record belongs to exactly one Academic Month.

This provides

- Monthly reporting
- Month locking
- Historical comparison
- Settlement generation
- Financial consistency

---

# 6.10 Referential Integrity Rules

The database shall enforce referential integrity through foreign keys.

Examples

A Quran Session cannot exist without

- Student
- Huffaz (User)
- Academic Month

A Student Attendance record cannot exist without

- Student
- Academic Month

A Fee Payment Transaction cannot exist without

- Student Fee Collection

A Settlement Detail cannot exist without

- Monthly Settlement

---

# 6.11 Cascade Rules

The database shall never cascade-delete transactional records.

Instead

Parent deletion

↓

Soft Delete

↓

Child records remain unchanged

Example

Deleting a Student shall not remove

- Attendance
- Quran Sessions
- Fee Collection
- Notes
- Marhala History

This preserves historical reports and financial records.

# 7. Table Specifications

This section defines every database table used in the application.

Each table specification includes:

- Purpose
- Columns
- Relationships
- Constraints
- Business Rules
- Recommended Indexes
- Prisma Notes

---

# 7.1 User

## Purpose

The User table stores all authenticated users of the system.

In Phase 1, users consist of:

- Admin
- Huffaz

A Huffaz is not stored in a separate table. Instead, every Huffaz is represented as a User with the role `HUFFAZ`.

---

## Columns

| Column       | Type         | Required | Default | Description       |
| ------------ | ------------ | -------- | ------- | ----------------- |
| id           | UUID         | Yes      | UUID    | Primary Key       |
| firstName    | VARCHAR(100) | Yes      | —       | First Name        |
| lastName     | VARCHAR(100) | No       | NULL    | Last Name         |
| fullName     | VARCHAR(200) | Yes      | —       | Full Name         |
| username     | VARCHAR(100) | Yes      | —       | Login Username    |
| email        | VARCHAR(150) | No       | NULL    | Email Address     |
| mobileNumber | VARCHAR(20)  | Yes      | —       | Mobile Number     |
| passwordHash | TEXT         | Yes      | —       | BCrypt Password   |
| role         | UserRole     | Yes      | HUFFAZ  | User Role         |
| profileImage | TEXT         | No       | NULL    | Profile Image URL |
| lastLoginAt  | TIMESTAMP    | No       | NULL    | Last Login        |
| isActive     | BOOLEAN      | Yes      | TRUE    | Active User       |
| createdAt    | TIMESTAMP    | Yes      | NOW()   | Created Time      |
| createdBy    | UUID         | No       | NULL    | Created By        |
| updatedAt    | TIMESTAMP    | Yes      | NOW()   | Updated Time      |
| updatedBy    | UUID         | No       | NULL    | Updated By        |
| deletedAt    | TIMESTAMP    | No       | NULL    | Soft Delete       |
| deletedBy    | UUID         | No       | NULL    | Deleted By        |

---

## Relationships

| Related Table         | Relationship                       |
| --------------------- | ---------------------------------- |
| HuffazAttendance      | One User → Many Attendance Records |
| QuranSession          | One User → Many Quran Sessions     |
| FeePaymentTransaction | One User → Many Transactions       |
| SettlementAdjustment  | One User → Many Adjustments        |

---

## Constraints

Username must be unique.

Mobile Number should be unique.

Email should be unique whenever provided.

Password is stored only as a hashed value.

Only ACTIVE users may login.

---

## Business Rules

Exactly one role per user.

Admin users can manage the entire system.

Huffaz users can only perform operations permitted by their role.

Soft deleted users cannot login.

Historical attendance and Quran Sessions remain available even after user deactivation.

---

## Recommended Indexes

PRIMARY KEY(id)

UNIQUE(username)

UNIQUE(mobileNumber)

INDEX(role)

INDEX(isActive)

---

## Prisma Notes

Use UUID as Primary Key.

Password should never be returned through APIs.

---

# 7.2 AcademicPeriod

## Purpose

Represents one complete academic year.

Example

2026–2027

One Academic Period contains multiple Academic Months.

---

## Columns

| Column    | Type        | Required | Default | Description             |
| --------- | ----------- | -------- | ------- | ----------------------- |
| id        | UUID        | Yes      | UUID    | Primary Key             |
| name      | VARCHAR(50) | Yes      | —       | Academic Period Name    |
| startDate | DATE        | Yes      | —       | Start Date              |
| endDate   | DATE        | Yes      | —       | End Date                |
| isCurrent | BOOLEAN     | Yes      | FALSE   | Current Academic Period |
| isActive  | BOOLEAN     | Yes      | TRUE    | Active Status           |
| createdAt | TIMESTAMP   | Yes      | NOW()   | Created Time            |
| createdBy | UUID        | No       | NULL    | Created By              |
| updatedAt | TIMESTAMP   | Yes      | NOW()   | Updated Time            |
| updatedBy | UUID        | No       | NULL    | Updated By              |
| deletedAt | TIMESTAMP   | No       | NULL    | Deleted At              |
| deletedBy | UUID        | No       | NULL    | Deleted By              |

---

## Relationships

AcademicPeriod

↓

AcademicMonth

(One to Many)

AcademicPeriod

↓

MarhalaFeeConfiguration

(One to Many)

---

## Constraints

Only one Academic Period may be marked as Current.

Date ranges cannot overlap.

---

## Business Rules

Previous Academic Periods remain immutable.

Historical reports use the Academic Period associated with each record.

---

## Recommended Indexes

PRIMARY KEY(id)

UNIQUE(name)

INDEX(isCurrent)

---

## Prisma Notes

Academic Period should never be deleted after operational data exists.

---

# 7.3 AcademicMonth

## Purpose

Represents one operational month within an Academic Period.

Every transactional record belongs to one Academic Month.

---

## Columns

| Column           | Type             | Required | Default | Description            |
| ---------------- | ---------------- | -------- | ------- | ---------------------- |
| id               | UUID             | Yes      | UUID    | Primary Key            |
| academicPeriodId | UUID             | Yes      | —       | Parent Academic Period |
| name             | VARCHAR(50)      | Yes      | —       | Month Name             |
| monthNumber      | SMALLINT         | Yes      | —       | 1–12                   |
| year             | INTEGER          | Yes      | —       | Calendar Year          |
| startDate        | DATE             | Yes      | —       | Month Start            |
| endDate          | DATE             | Yes      | —       | Month End              |
| workingDays      | SMALLINT         | Yes      | —       | Working Days           |
| settlementStatus | SettlementStatus | Yes      | DRAFT   | Settlement State       |
| isCurrent        | BOOLEAN          | Yes      | FALSE   | Current Month          |
| isActive         | BOOLEAN          | Yes      | TRUE    | Active Status          |
| createdAt        | TIMESTAMP        | Yes      | NOW()   | Created Time           |
| createdBy        | UUID             | No       | NULL    | Created By             |
| updatedAt        | TIMESTAMP        | Yes      | NOW()   | Updated Time           |
| updatedBy        | UUID             | No       | NULL    | Updated By             |
| deletedAt        | TIMESTAMP        | No       | NULL    | Deleted At             |
| deletedBy        | UUID             | No       | NULL    | Deleted By             |

---

## Relationships

AcademicMonth

↓

StudentAttendance

AcademicMonth

↓

HuffazAttendance

AcademicMonth

↓

QuranSession

AcademicMonth

↓

StudentFeeCollection

AcademicMonth

↓

MonthlySettlement

---

## Constraints

Only one current Academic Month.

Each month belongs to one Academic Period.

Month Number must be between 1 and 12.

---

## Business Rules

Operational records cannot exist without an Academic Month.

Locked months become read-only.

Settlement generation is allowed only after month completion.

---

## Recommended Indexes

PRIMARY KEY(id)

INDEX(academicPeriodId)

INDEX(monthNumber)

INDEX(settlementStatus)

INDEX(isCurrent)

---

## Prisma Notes

Settlement status controls modification permissions throughout the application.

---

# 7.4 Marhala

## Purpose

Stores the master list of Marhalas supported by the institute.

This is a reference table and changes infrequently.

---

## Columns

| Column       | Type         | Required | Default | Description   |
| ------------ | ------------ | -------- | ------- | ------------- |
| id           | UUID         | Yes      | UUID    | Primary Key   |
| code         | MarhalaCode  | Yes      | —       | Internal Code |
| name         | VARCHAR(100) | Yes      | —       | Display Name  |
| displayOrder | SMALLINT     | Yes      | —       | Sort Order    |
| description  | TEXT         | No       | NULL    | Description   |
| isActive     | BOOLEAN      | Yes      | TRUE    | Active Status |

---

## Relationships

Marhala

↓

Student

Marhala

↓

MarhalaHistory

Marhala

↓

MarhalaFeeConfiguration

---

## Constraints

Marhala code must be unique.

Display Order must be unique.

---

## Business Rules

Reference data only.

Seeded during application setup.

Deletion is not permitted.

---

## Recommended Indexes

PRIMARY KEY(id)

UNIQUE(code)

UNIQUE(displayOrder)

---

## Prisma Notes

Treat this table as a lookup table.

---

# 7.5 MarhalaFeeConfiguration

## Purpose

Stores the monthly fee for each Marhala within a specific Academic Period.

This preserves historical fee structures across academic years.

---

## Columns

| Column           | Type          | Required | Default | Description     |
| ---------------- | ------------- | -------- | ------- | --------------- |
| id               | UUID          | Yes      | UUID    | Primary Key     |
| academicPeriodId | UUID          | Yes      | —       | Academic Period |
| marhalaId        | UUID          | Yes      | —       | Marhala         |
| monthlyFee       | DECIMAL(10,2) | Yes      | 0.00    | Monthly Fee     |
| effectiveFrom    | DATE          | Yes      | —       | Effective Date  |
| effectiveTo      | DATE          | No       | NULL    | End Date        |
| isActive         | BOOLEAN       | Yes      | TRUE    | Active Status   |
| createdAt        | TIMESTAMP     | Yes      | NOW()   | Created Time    |
| createdBy        | UUID          | No       | NULL    | Created By      |
| updatedAt        | TIMESTAMP     | Yes      | NOW()   | Updated Time    |
| updatedBy        | UUID          | No       | NULL    | Updated By      |

---

## Relationships

AcademicPeriod

↓

MarhalaFeeConfiguration

Marhala

↓

MarhalaFeeConfiguration

---

## Constraints

One active fee configuration per Marhala within an Academic Period.

Monthly Fee cannot be negative.

---

## Business Rules

Historical fee records must never be updated.

When fees change for a new academic year, create new configuration records.

Existing settlements continue using the fee configuration associated with their Academic Period.

---

## Recommended Indexes

PRIMARY KEY(id)

INDEX(academicPeriodId)

INDEX(marhalaId)

UNIQUE(academicPeriodId, marhalaId)

---

## Prisma Notes

This table should be seeded during Academic Period setup and referenced during Student Fee Collection creation.

# 7.6 Student

## Purpose

The Student table stores the master profile of every student enrolled in the institute.

This table contains only relatively static information.

Daily operational data such as attendance, Quran learning progress, notes, promotions, and fee collection are maintained in separate transactional tables.

---

## Columns

| Column             | Type          | Required | Default      | Description         |
| ------------------ | ------------- | -------- | ------------ | ------------------- |
| id                 | UUID          | Yes      | UUID         | Primary Key         |
| itsNumber          | VARCHAR(20)   | Yes      | —            | Unique ITS Number   |
| firstName          | VARCHAR(100)  | Yes      | —            | First Name          |
| lastName           | VARCHAR(100)  | No       | NULL         | Last Name           |
| fullName           | VARCHAR(200)  | Yes      | —            | Full Name           |
| fatherName         | VARCHAR(200)  | No       | NULL         | Father's Name       |
| gender             | Gender        | Yes      | —            | Student Gender      |
| dateOfBirth        | DATE          | No       | NULL         | Date of Birth       |
| admissionDate      | DATE          | Yes      | CURRENT_DATE | Admission Date      |
| mobileNumber       | VARCHAR(20)   | No       | NULL         | Student Mobile      |
| parentMobileNumber | VARCHAR(20)   | Yes      | —            | Parent Mobile       |
| address            | TEXT          | No       | NULL         | Residential Address |
| photoUrl           | TEXT          | No       | NULL         | Student Photo       |
| currentMarhalaId   | UUID          | Yes      | —            | Current Marhala     |
| status             | StudentStatus | Yes      | ACTIVE       | Current Status      |
| remarks            | TEXT          | No       | NULL         | General Remarks     |
| isActive           | BOOLEAN       | Yes      | TRUE         | Active Flag         |
| createdAt          | TIMESTAMP     | Yes      | NOW()        | Created Time        |
| createdBy          | UUID          | No       | NULL         | Created By          |
| updatedAt          | TIMESTAMP     | Yes      | NOW()        | Updated Time        |
| updatedBy          | UUID          | No       | NULL         | Updated By          |
| deletedAt          | TIMESTAMP     | No       | NULL         | Soft Delete Time    |
| deletedBy          | UUID          | No       | NULL         | Deleted By          |

---

## Relationships

| Related Table        | Relationship                           |
| -------------------- | -------------------------------------- |
| Marhala              | Many Students → One Marhala            |
| StudentAttendance    | One Student → Many Attendance Records  |
| QuranSession         | One Student → Many Sessions            |
| StudentNote          | One Student → Many Notes               |
| MarhalaHistory       | One Student → Many Marhala Changes     |
| StudentFeeCollection | One Student → Many Monthly Fee Records |

---

## Constraints

ITS Number must be unique.

Parent Mobile Number is mandatory.

Every student must belong to one active Marhala.

Student status must always contain a valid enum value.

---

## Business Rules

Student information should rarely change after admission.

Changing the current Marhala automatically requires creating a MarhalaHistory record.

Deleting a student performs a soft delete only.

Historical records remain intact.

---

## Recommended Indexes

PRIMARY KEY(id)

UNIQUE(itsNumber)

INDEX(currentMarhalaId)

INDEX(status)

INDEX(parentMobileNumber)

INDEX(isActive)

---

## Prisma Notes

Do not store attendance, Quran progress, fee collection, or notes directly in this table.

---

# 7.7 StudentAttendance

## Purpose

Stores daily attendance for every student.

One record represents one student's attendance for one Academic Month day.

---

## Columns

| Column           | Type             | Required | Default | Description                |
| ---------------- | ---------------- | -------- | ------- | -------------------------- |
| id               | UUID             | Yes      | UUID    | Primary Key                |
| studentId        | UUID             | Yes      | —       | Student                    |
| academicMonthId  | UUID             | Yes      | —       | Academic Month             |
| attendanceDate   | DATE             | Yes      | —       | Attendance Date            |
| attendanceStatus | AttendanceStatus | Yes      | PRESENT | Attendance Status          |
| remarks          | TEXT             | No       | NULL    | Remarks                    |
| markedBy         | UUID             | Yes      | —       | User who marked attendance |
| markedAt         | TIMESTAMP        | Yes      | NOW()   | Marked Time                |
| createdAt        | TIMESTAMP        | Yes      | NOW()   | Created Time               |
| updatedAt        | TIMESTAMP        | Yes      | NOW()   | Updated Time               |

---

## Relationships

Student

↓

StudentAttendance

AcademicMonth

↓

StudentAttendance

User

↓

StudentAttendance (Marked By)

---

## Constraints

One attendance record per Student per Date.

Attendance date must fall within the selected Academic Month.

---

## Business Rules

Attendance cannot be duplicated.

Attendance history is immutable after settlement lock.

Attendance contributes to reporting only.

Student attendance does not affect Huffaz payable calculations.

---

## Recommended Indexes

PRIMARY KEY(id)

UNIQUE(studentId, attendanceDate)

INDEX(academicMonthId)

INDEX(attendanceDate)

INDEX(attendanceStatus)

---

## Prisma Notes

Use a composite unique constraint on `(studentId, attendanceDate)`.

---

# 7.8 StudentNote

## Purpose

Stores remarks, observations, and general notes about a student.

Notes are independent from Quran Sessions.

Examples

- Behaviour
- Parent discussion
- Medical note
- Discipline issue
- General observation

---

## Columns

| Column    | Type         | Required | Default      | Description  |
| --------- | ------------ | -------- | ------------ | ------------ |
| id        | UUID         | Yes      | UUID         | Primary Key  |
| studentId | UUID         | Yes      | —            | Student      |
| noteDate  | DATE         | Yes      | CURRENT_DATE | Note Date    |
| title     | VARCHAR(150) | No       | NULL         | Note Title   |
| note      | TEXT         | Yes      | —            | Note Content |
| createdBy | UUID         | Yes      | —            | User         |
| createdAt | TIMESTAMP    | Yes      | NOW()        | Created Time |
| updatedAt | TIMESTAMP    | Yes      | NOW()        | Updated Time |

---

## Relationships

Student

↓

StudentNote

User

↓

StudentNote

---

## Constraints

Every note belongs to exactly one Student.

---

## Business Rules

Notes are chronological.

Editing is allowed before settlement lock.

Notes are excluded from financial calculations.

---

## Recommended Indexes

PRIMARY KEY(id)

INDEX(studentId)

INDEX(noteDate)

INDEX(createdBy)

---

## Prisma Notes

Notes should be returned sorted by newest first.

---

# 7.9 MarhalaHistory

## Purpose

Maintains the complete promotion history of every student.

No promotion should overwrite historical data.

---

## Columns

| Column        | Type      | Required | Default      | Description      |
| ------------- | --------- | -------- | ------------ | ---------------- |
| id            | UUID      | Yes      | UUID         | Primary Key      |
| studentId     | UUID      | Yes      | —            | Student          |
| fromMarhalaId | UUID      | No       | NULL         | Previous Marhala |
| toMarhalaId   | UUID      | Yes      | —            | New Marhala      |
| effectiveDate | DATE      | Yes      | CURRENT_DATE | Promotion Date   |
| reason        | TEXT      | No       | NULL         | Promotion Reason |
| promotedBy    | UUID      | Yes      | —            | User             |
| createdAt     | TIMESTAMP | Yes      | NOW()        | Created Time     |

---

## Relationships

Student

↓

MarhalaHistory

Marhala

↓

MarhalaHistory

User

↓

MarhalaHistory

---

## Constraints

Promotion date cannot precede admission date.

From Marhala may be NULL only for the initial admission.

---

## Business Rules

Every Marhala change creates a new history record.

The Student.currentMarhalaId must always match the latest MarhalaHistory entry.

Historical promotion records are never updated or deleted.

---

## Recommended Indexes

PRIMARY KEY(id)

INDEX(studentId)

INDEX(effectiveDate)

INDEX(toMarhalaId)

---

## Prisma Notes

The latest MarhalaHistory record should be considered the authoritative promotion history, while Student.currentMarhalaId provides fast access to the student's current Marhala without requiring aggregation.

# 7.10 QuranSession

## Purpose

The QuranSession table records every teaching session conducted between a Huffaz and a Student.

Each session represents one learning activity and becomes part of the student's permanent Quran journey.

No Quran progress is stored directly on the Student table.

This table serves as the primary source for:

- Student Progress Timeline
- Daily Learning History
- Performance Reports
- Dashboard Statistics
- Future Analytics

---

## Columns

| Column          | Type         | Required | Default      | Description            |
| --------------- | ------------ | -------- | ------------ | ---------------------- |
| id              | UUID         | Yes      | UUID         | Primary Key            |
| studentId       | UUID         | Yes      | —            | Student                |
| huffazId        | UUID         | Yes      | —            | User (Role = HUFFAZ)   |
| academicMonthId | UUID         | Yes      | —            | Academic Month         |
| sessionDate     | DATE         | Yes      | CURRENT_DATE | Teaching Date          |
| sessionType     | SessionType  | Yes      | MIXED        | Session Type           |
| siparaNumber    | SMALLINT     | No       | NULL         | Sipara Number          |
| surahName       | VARCHAR(150) | No       | NULL         | Surah Name             |
| startAyah       | INTEGER      | No       | NULL         | Starting Ayah          |
| endAyah         | INTEGER      | No       | NULL         | Ending Ayah            |
| murajaahJuz     | SMALLINT     | No       | NULL         | Murajaah Juz           |
| murajaahMarks   | DECIMAL(5,2) | No       | NULL         | Murajaah Score         |
| juzHaaliMarks   | DECIMAL(5,2) | No       | NULL         | Juz Haali Score        |
| jadeedStartAyah | INTEGER      | No       | NULL         | New Lesson Start       |
| jadeedEndAyah   | INTEGER      | No       | NULL         | New Lesson End         |
| tasmeeMarks     | DECIMAL(5,2) | No       | NULL         | Tasmee Score           |
| hifzProgress    | VARCHAR(200) | No       | NULL         | Progress Summary       |
| durationMinutes | SMALLINT     | No       | NULL         | Session Duration       |
| remarks         | TEXT         | No       | NULL         | Session Remarks        |
| recordedBy      | UUID         | Yes      | —            | User Recording Session |
| createdAt       | TIMESTAMP    | Yes      | NOW()        | Created Time           |
| updatedAt       | TIMESTAMP    | Yes      | NOW()        | Updated Time           |
| deletedAt       | TIMESTAMP    | No       | NULL         | Soft Delete            |
| deletedBy       | UUID         | No       | NULL         | Deleted By             |
| isActive        | BOOLEAN      | Yes      | TRUE         | Active Flag            |

---

## Relationships

Student

↓

QuranSession

User (HUFFAZ)

↓

QuranSession

AcademicMonth

↓

QuranSession

User

↓

QuranSession (Recorded By)

---

## Constraints

Every Quran Session belongs to:

- One Student
- One Huffaz
- One Academic Month

Session Date must fall within the selected Academic Month.

Marks must remain within the institute's configured range.

---

## Business Rules

One student may have multiple sessions on the same day if required.

A Huffaz may conduct sessions for multiple students.

Students are never permanently assigned to a Huffaz.

Deleting a session performs a soft delete only.

Locked Academic Months prevent modification.

---

## Recommended Indexes

PRIMARY KEY(id)

INDEX(studentId)

INDEX(huffazId)

INDEX(academicMonthId)

INDEX(sessionDate)

INDEX(sessionType)

---

## Prisma Notes

This table represents the complete Quran learning history.

All student progress reports should derive their information from QuranSession records.

---

# 7.11 HuffazAttendance

## Purpose

Stores daily attendance records for Huffaz.

These records are used for:

- Attendance Reports
- Monthly Settlement Calculation
- Dashboard Statistics

Unlike Student Attendance, Huffaz Attendance directly affects payable amount calculations.

---

## Columns

| Column            | Type             | Required | Default | Description        |
| ----------------- | ---------------- | -------- | ------- | ------------------ |
| id                | UUID             | Yes      | UUID    | Primary Key        |
| userId            | UUID             | Yes      | —       | Huffaz (User)      |
| academicMonthId   | UUID             | Yes      | —       | Academic Month     |
| attendanceDate    | DATE             | Yes      | —       | Attendance Date    |
| attendanceStatus  | AttendanceStatus | Yes      | PRESENT | Attendance Status  |
| payablePercentage | DECIMAL(5,2)     | Yes      | 100.00  | Payable Percentage |
| remarks           | TEXT             | No       | NULL    | Remarks            |
| markedBy          | UUID             | Yes      | —       | Admin User         |
| markedAt          | TIMESTAMP        | Yes      | NOW()   | Marked Time        |
| createdAt         | TIMESTAMP        | Yes      | NOW()   | Created Time       |
| updatedAt         | TIMESTAMP        | Yes      | NOW()   | Updated Time       |

---

## Relationships

User (HUFFAZ)

↓

HuffazAttendance

AcademicMonth

↓

HuffazAttendance

Admin User

↓

HuffazAttendance

---

## Constraints

One attendance record per Huffaz per day.

Only Admin users may create or modify attendance.

Attendance date must belong to the selected Academic Month.

---

## Business Rules

Attendance Status Payable Effect

Present → 100%

Half Day → 50%

Leave → 0%

Absent → 0%

Uzur → 0%

Attendance cannot be modified after settlement lock.

---

## Recommended Indexes

PRIMARY KEY(id)

UNIQUE(userId, attendanceDate)

INDEX(academicMonthId)

INDEX(attendanceDate)

INDEX(attendanceStatus)

---

## Prisma Notes

The payablePercentage field stores the calculated eligibility for settlement calculations, allowing future rule changes without affecting historical records.

---

# Quran Journey Workflow

Student

↓

Attendance

↓

Quran Session

↓

Progress Timeline

↓

Performance Reports

↓

Marhala Promotion

Every Quran Session contributes to the student's long-term academic history.

Attendance and Quran Sessions remain independent entities.

This separation ensures that attendance tracking and learning progress evolve independently while remaining linked through the Student and Academic Month.

---

# Huffaz Daily Workflow

Admin

↓

Marks Huffaz Attendance

↓

Huffaz Conducts Sessions

↓

Quran Sessions Recorded

↓

Month Ends

↓

Monthly Settlement Generated

This workflow ensures that payable calculations are based on finalized attendance while preserving complete teaching history for every student.

# 7.12 StudentFeeCollection

## Purpose

The StudentFeeCollection table stores the monthly fee summary for every student.

Exactly one record exists for each Student and Academic Month.

This table acts as the financial summary while individual payments are maintained in the FeePaymentTransaction table.

It serves as the primary source for:

- Monthly Fee Status
- Fee Collection Summary
- Payable Pool Calculation
- Outstanding Fee Reports
- Monthly Settlement

---

## Columns

| Column                    | Type          | Required | Default | Description                 |
| ------------------------- | ------------- | -------- | ------- | --------------------------- |
| id                        | UUID          | Yes      | UUID    | Primary Key                 |
| studentId                 | UUID          | Yes      | —       | Student                     |
| academicMonthId           | UUID          | Yes      | —       | Academic Month              |
| marhalaFeeConfigurationId | UUID          | Yes      | —       | Fee Configuration Used      |
| configuredFee             | DECIMAL(10,2) | Yes      | 0.00    | Original Monthly Fee        |
| discountAmount            | DECIMAL(10,2) | Yes      | 0.00    | Discount Applied            |
| waivedAmount              | DECIMAL(10,2) | Yes      | 0.00    | Waived Amount               |
| totalReceivedAmount       | DECIMAL(10,2) | Yes      | 0.00    | Total Received (Calculated) |
| outstandingAmount         | DECIMAL(10,2) | Yes      | 0.00    | Remaining Balance           |
| paymentStatus             | PaymentStatus | Yes      | UNPAID  | Current Status              |
| remarks                   | TEXT          | No       | NULL    | Payment Remarks             |
| collectedBy               | UUID          | No       | NULL    | Admin User                  |
| createdAt                 | TIMESTAMP     | Yes      | NOW()   | Created Time                |
| createdBy                 | UUID          | No       | NULL    | Created By                  |
| updatedAt                 | TIMESTAMP     | Yes      | NOW()   | Updated Time                |
| updatedBy                 | UUID          | No       | NULL    | Updated By                  |
| deletedAt                 | TIMESTAMP     | No       | NULL    | Deleted At                  |
| deletedBy                 | UUID          | No       | NULL    | Deleted By                  |
| isActive                  | BOOLEAN       | Yes      | TRUE    | Active Flag                 |

---

## Relationships

Student

↓

StudentFeeCollection

AcademicMonth

↓

StudentFeeCollection

MarhalaFeeConfiguration

↓

StudentFeeCollection

StudentFeeCollection

↓

FeePaymentTransaction

(One to Many)

---

## Constraints

One Student Fee Collection per Student per Academic Month.

Configured Fee cannot be negative.

Discount Amount cannot exceed Configured Fee.

Waived Amount cannot exceed Configured Fee.

Outstanding Amount cannot be negative.

---

## Business Rules

Exactly one monthly fee collection record shall exist for every active student.

Configured Fee is copied from MarhalaFeeConfiguration at record creation and never changes afterwards.

Total Received Amount is calculated as the sum of all FeePaymentTransactions.

Outstanding Amount is calculated as:

Configured Fee
− Discount Amount
− Waived Amount
− Total Received Amount

Only Total Received Amount contributes to the monthly payable pool.

Payment Status shall be derived as follows:

- PAID → Outstanding Amount = 0
- PARTIAL_PAID → Total Received > 0 and Outstanding > 0
- UNPAID → Total Received = 0
- WAIVED → Configured Fee = Waived Amount
- DISCOUNTED → Discount Amount > 0

Locked Academic Months prohibit modifications.

---

## Recommended Indexes

PRIMARY KEY(id)

UNIQUE(studentId, academicMonthId)

INDEX(studentId)

INDEX(academicMonthId)

INDEX(paymentStatus)

INDEX(collectedBy)

---

## Prisma Notes

Store configuredFee as a snapshot value.

Do not reference MarhalaFeeConfiguration during settlement calculations.

Historical settlements must remain unaffected even if fee configurations change in future academic periods.

---

# 7.13 FeePaymentTransaction

## Purpose

Stores every payment transaction received against a Student Fee Collection.

Supports:

- Installments
- Partial Payments
- Multiple Receipts
- Future Refunds
- Payment Audit Trail

The StudentFeeCollection table stores only the summary.

---

## Columns

| Column                 | Type          | Required | Default      | Description                |
| ---------------------- | ------------- | -------- | ------------ | -------------------------- |
| id                     | UUID          | Yes      | UUID         | Primary Key                |
| studentFeeCollectionId | UUID          | Yes      | —            | Monthly Fee Collection     |
| transactionDate        | DATE          | Yes      | CURRENT_DATE | Payment Date               |
| amount                 | DECIMAL(10,2) | Yes      | 0.00         | Amount Received            |
| paymentMode            | VARCHAR(30)   | Yes      | CASH         | Cash / UPI / Bank Transfer |
| referenceNumber        | VARCHAR(100)  | No       | NULL         | Transaction Reference      |
| remarks                | TEXT          | No       | NULL         | Remarks                    |
| receivedBy             | UUID          | Yes      | —            | Admin User                 |
| createdAt              | TIMESTAMP     | Yes      | NOW()        | Created Time               |
| updatedAt              | TIMESTAMP     | Yes      | NOW()        | Updated Time               |
| deletedAt              | TIMESTAMP     | No       | NULL         | Deleted At                 |
| deletedBy              | UUID          | No       | NULL         | Deleted By                 |
| isActive               | BOOLEAN       | Yes      | TRUE         | Active Flag                |

---

## Relationships

StudentFeeCollection

↓

FeePaymentTransaction

User

↓

FeePaymentTransaction

(Received By)

---

## Constraints

Payment Amount must be greater than zero.

Transaction Date must belong to the selected Academic Month.

Received By must reference an Admin user.

---

## Business Rules

Multiple transactions may exist for one monthly fee collection.

Deleting a transaction performs a soft delete only.

Updating or deleting a transaction automatically requires recalculation of:

- Total Received Amount
- Outstanding Amount
- Payment Status

Transactions cannot be added, edited, or removed after the Academic Month is locked.

---

## Recommended Indexes

PRIMARY KEY(id)

INDEX(studentFeeCollectionId)

INDEX(transactionDate)

INDEX(receivedBy)

INDEX(paymentMode)

---

## Prisma Notes

Never calculate balances from cached values alone.

Always aggregate active FeePaymentTransaction records to ensure financial consistency.

---

# Finance Workflow

Academic Month

↓

Generate Student Fee Collection

↓

Student Pays Fee

↓

Admin Records Payment

↓

FeePaymentTransaction Created

↓

StudentFeeCollection Updated

↓

Outstanding Amount Recalculated

↓

Payment Status Updated

↓

Month End Settlement

---

# Payable Pool Calculation

For a selected Academic Month:

Payable Pool

=

SUM(StudentFeeCollection.totalReceivedAmount)

WHERE

- Academic Month = Selected Month
- Student Fee Collection is Active

Discounts and waived amounts reduce the student's outstanding balance but do not contribute to the payable pool.

Only the actual amount received is considered during Monthly Settlement generation.

---

# Payment Status Lifecycle

UNPAID

↓

PARTIAL_PAID

↓

PAID

OR

WAIVED

OR

DISCOUNTED

The lifecycle is automatically managed by the system based on fee transactions and financial adjustments.

# 7.14 MonthlySettlement

## Purpose

The MonthlySettlement table represents the financial summary for one Academic Month.

It is generated after the completion of the Academic Month and serves as the settlement header for all Huffaz payable calculations.

The table stores overall financial statistics and controls the settlement lifecycle.

---

## Columns

| Column               | Type             | Required | Default   | Description                       |
| -------------------- | ---------------- | -------- | --------- | --------------------------------- |
| id                   | UUID             | Yes      | UUID      | Primary Key                       |
| academicMonthId      | UUID             | Yes      | —         | Academic Month                    |
| totalStudents        | INTEGER          | Yes      | 0         | Active Students                   |
| totalConfiguredFees  | DECIMAL(10,2)    | Yes      | 0.00      | Expected Collection               |
| totalDiscountAmount  | DECIMAL(10,2)    | Yes      | 0.00      | Total Discounts                   |
| totalWaivedAmount    | DECIMAL(10,2)    | Yes      | 0.00      | Total Waived Amount               |
| totalCollectedAmount | DECIMAL(10,2)    | Yes      | 0.00      | Actual Collection                 |
| totalPayablePool     | DECIMAL(10,2)    | Yes      | 0.00      | Amount Available for Distribution |
| settlementStatus     | SettlementStatus | Yes      | GENERATED | Settlement Status                 |
| generatedAt          | TIMESTAMP        | Yes      | NOW()     | Generation Time                   |
| generatedBy          | UUID             | Yes      | —         | Generated By                      |
| lockedAt             | TIMESTAMP        | No       | NULL      | Lock Time                         |
| lockedBy             | UUID             | No       | NULL      | Locked By                         |
| remarks              | TEXT             | No       | NULL      | Settlement Remarks                |
| createdAt            | TIMESTAMP        | Yes      | NOW()     | Created Time                      |
| updatedAt            | TIMESTAMP        | Yes      | NOW()     | Updated Time                      |

---

## Relationships

AcademicMonth

↓

MonthlySettlement

MonthlySettlement

↓

MonthlySettlementDetail

(One to Many)

MonthlySettlement

↓

SettlementAdjustment

(One to Many)

User

↓

MonthlySettlement

(Generated By / Locked By)

---

## Constraints

One settlement per Academic Month.

Settlement generation allowed only after month completion.

Locked settlement cannot be modified.

---

## Business Rules

Settlement generation performs:

- Fee collection aggregation
- Attendance verification
- Payable calculation
- Detail generation

Settlement Status lifecycle:

DRAFT

↓

GENERATED

↓

LOCKED

Only LOCKED settlements are considered finalized.

---

## Recommended Indexes

PRIMARY KEY(id)

UNIQUE(academicMonthId)

INDEX(settlementStatus)

INDEX(generatedBy)

---

## Prisma Notes

Settlement values are snapshots.

Historical settlements must never be recalculated automatically after locking.

---

# 7.15 MonthlySettlementDetail

## Purpose

Stores one settlement record for each Huffaz within a Monthly Settlement.

This table contains the calculated payable amount before and after manual adjustments.

It serves as the official payable statement for every Huffaz.

---

## Columns

| Column               | Type          | Required | Default | Description              |
| -------------------- | ------------- | -------- | ------- | ------------------------ |
| id                   | UUID          | Yes      | UUID    | Primary Key              |
| monthlySettlementId  | UUID          | Yes      | —       | Settlement Header        |
| userId               | UUID          | Yes      | —       | Huffaz User              |
| attendanceDays       | DECIMAL(5,2)  | Yes      | 0.00    | Effective Attendance     |
| attendancePercentage | DECIMAL(5,2)  | Yes      | 0.00    | Attendance Percentage    |
| calculatedAmount     | DECIMAL(10,2) | Yes      | 0.00    | System Calculated Amount |
| bonusAmount          | DECIMAL(10,2) | Yes      | 0.00    | Bonus Applied            |
| deductionAmount      | DECIMAL(10,2) | Yes      | 0.00    | Deduction Applied        |
| finalPayableAmount   | DECIMAL(10,2) | Yes      | 0.00    | Final Payable Amount     |
| remarks              | TEXT          | No       | NULL    | Remarks                  |
| createdAt            | TIMESTAMP     | Yes      | NOW()   | Created Time             |
| updatedAt            | TIMESTAMP     | Yes      | NOW()   | Updated Time             |

---

## Relationships

MonthlySettlement

↓

MonthlySettlementDetail

User (HUFFAZ)

↓

MonthlySettlementDetail

SettlementAdjustment

↓

MonthlySettlementDetail

---

## Constraints

One detail record per Huffaz per Monthly Settlement.

Final Payable Amount cannot be negative.

---

## Business Rules

Calculated Amount is system generated.

Bonus and Deduction are administrator-controlled.

Final Payable Amount is calculated as:

Calculated Amount

-

Bonus Amount

−

Deduction Amount

Historical settlement details remain immutable after locking.

---

## Recommended Indexes

PRIMARY KEY(id)

UNIQUE(monthlySettlementId, userId)

INDEX(userId)

INDEX(finalPayableAmount)

---

## Prisma Notes

This table represents the official payable statement for each Huffaz.

Reports and exports should always read from this table after settlement generation.

---

# 7.16 SettlementAdjustment

## Purpose

Maintains a complete audit trail of all manual adjustments applied to Monthly Settlement Details.

Instead of overwriting values, every adjustment is stored as an independent transaction.

This ensures complete financial transparency and accountability.

---

## Columns

| Column                    | Type          | Required | Default | Description       |
| ------------------------- | ------------- | -------- | ------- | ----------------- |
| id                        | UUID          | Yes      | UUID    | Primary Key       |
| monthlySettlementDetailId | UUID          | Yes      | —       | Settlement Detail |
| adjustmentType            | VARCHAR(20)   | Yes      | —       | BONUS / DEDUCTION |
| amount                    | DECIMAL(10,2) | Yes      | 0.00    | Adjustment Amount |
| reason                    | TEXT          | Yes      | —       | Adjustment Reason |
| adjustedBy                | UUID          | Yes      | —       | Admin User        |
| adjustedAt                | TIMESTAMP     | Yes      | NOW()   | Adjustment Time   |
| createdAt                 | TIMESTAMP     | Yes      | NOW()   | Created Time      |

---

## Relationships

MonthlySettlementDetail

↓

SettlementAdjustment

User (ADMIN)

↓

SettlementAdjustment

---

## Constraints

Adjustment Amount must be greater than zero.

Only Admin users may create adjustments.

Adjustments are prohibited after settlement lock.

---

## Business Rules

Every bonus or deduction creates a separate adjustment record.

Historical adjustments must never be edited or deleted.

Final Payable Amount is recalculated after every adjustment until the settlement is locked.

---

## Recommended Indexes

PRIMARY KEY(id)

INDEX(monthlySettlementDetailId)

INDEX(adjustedBy)

INDEX(adjustedAt)

---

## Prisma Notes

Maintain adjustments as immutable financial transactions.

Do not overwrite historical adjustment records.

---

# Settlement Workflow

Academic Month Completed

↓

Verify Student Fee Collections

↓

Verify Huffaz Attendance

↓

Generate Monthly Settlement

↓

Generate Settlement Details

↓

Apply Manual Adjustments (Optional)

↓

Review Settlement

↓

Lock Settlement

↓

Month Becomes Read Only

---

# Settlement Calculation Flow

StudentFeeCollection

↓

SUM(Total Received Amount)

↓

Total Payable Pool

↓

Attendance-Based Distribution

↓

MonthlySettlementDetail

↓

Bonus / Deduction

↓

Final Payable Amount

---

# Settlement Lock Rules

Once a Monthly Settlement is LOCKED:

- Student Attendance cannot be modified.
- Huffaz Attendance cannot be modified.
- Quran Sessions cannot be modified.
- Student Fee Collections cannot be modified.
- Fee Payment Transactions cannot be modified.
- Settlement Details cannot be modified.
- Settlement Adjustments cannot be created.

Locked settlements become the permanent financial record for the Academic Month.

# 8. Audit Strategy

## Purpose

The application manages academic and financial information that must remain historically accurate.

Every important business transaction shall be auditable.

The audit strategy ensures:

- Accountability
- Historical Traceability
- Financial Transparency
- Data Recovery
- Regulatory Readiness

---

## Standard Audit Columns

Unless explicitly excluded (reference tables), operational tables shall include:

| Column    | Type      | Purpose                        |
| --------- | --------- | ------------------------------ |
| createdAt | TIMESTAMP | Record creation time           |
| createdBy | UUID      | User who created the record    |
| updatedAt | TIMESTAMP | Last modification time         |
| updatedBy | UUID      | User who updated the record    |
| deletedAt | TIMESTAMP | Soft delete timestamp          |
| deletedBy | UUID      | User who performed soft delete |
| isActive  | BOOLEAN   | Active/Inactive indicator      |

---

## Tables Using Full Audit Columns

Authentication

- User

Academic

- AcademicPeriod
- AcademicMonth
- MarhalaFeeConfiguration

Student

- Student
- StudentAttendance
- QuranSession
- StudentNote
- MarhalaHistory

Finance

- StudentFeeCollection
- FeePaymentTransaction
- MonthlySettlement
- MonthlySettlementDetail
- SettlementAdjustment

---

## Lookup Tables

Reference tables generally require only:

- createdAt
- isActive

Examples:

- Marhala

Future lookup tables should follow the same lightweight pattern unless business requirements dictate otherwise.

---

## Soft Delete Policy

Operational records shall never be physically deleted.

Instead:

- deletedAt
- deletedBy
- isActive

shall be updated.

Historical records remain available for:

- Reports
- Dashboards
- Settlement History
- Audit Review

---

## Immutable Financial Records

The following records become immutable after settlement lock:

- StudentFeeCollection
- FeePaymentTransaction
- HuffazAttendance
- StudentAttendance
- QuranSession
- MonthlySettlement
- MonthlySettlementDetail
- SettlementAdjustment

No updates or deletions are permitted after the Academic Month reaches the LOCKED state.

---

# 9. Indexing Strategy

## Purpose

Indexes are designed to support:

- Fast Dashboard Loading
- Efficient Reporting
- Settlement Generation
- Student Search
- Attendance Queries
- Financial Reports

---

## Primary Key Strategy

Every operational table uses:

UUID

Advantages:

- Globally unique
- Safe for distributed systems
- Suitable for future synchronization
- Prevents predictable identifiers

---

## Unique Indexes

Examples:

User

- username
- mobileNumber

Student

- itsNumber

AcademicPeriod

- name

AcademicMonth

- (academicPeriodId, monthNumber, year)

StudentFeeCollection

- (studentId, academicMonthId)

MonthlySettlement

- academicMonthId

MonthlySettlementDetail

- (monthlySettlementId, userId)

---

## Foreign Key Indexes

Every foreign key should have an index.

Examples:

studentId

userId

academicMonthId

marhalaId

monthlySettlementId

studentFeeCollectionId

This ensures efficient JOIN operations and report generation.

---

## Frequently Queried Columns

Recommended indexes:

Student

- currentMarhalaId
- status

Attendance

- attendanceDate
- attendanceStatus

QuranSession

- sessionDate
- studentId
- huffazId

Finance

- paymentStatus
- transactionDate

Settlement

- settlementStatus
- generatedAt

---

## Composite Indexes

Recommended composite indexes:

StudentAttendance

(studentId, attendanceDate)

HuffazAttendance

(userId, attendanceDate)

StudentFeeCollection

(studentId, academicMonthId)

MonthlySettlementDetail

(monthlySettlementId, userId)

FeePaymentTransaction

(studentFeeCollectionId, transactionDate)

These indexes optimize reporting and prevent duplicate operational records.

---

# 10. Prisma Design Notes

## ORM

Prisma ORM

Database

PostgreSQL

---

## ID Strategy

Every entity shall use:

String

@id

@default(uuid())

---

## Relationships

Use explicit Prisma relations.

Example:

Student

↓

QuranSession

↓

User (HUFFAZ)

Avoid implicit relations to improve schema readability.

---

## Enumerations

Use Prisma enums for:

- UserRole
- Gender
- AttendanceStatus
- StudentStatus
- PaymentStatus
- SessionType
- SettlementStatus
- MarhalaCode

Avoid string literals for business state values.

---

## Decimal Fields

Use Prisma Decimal for monetary values.

Examples:

configuredFee

discountAmount

waivedAmount

totalReceivedAmount

calculatedAmount

bonusAmount

deductionAmount

finalPayableAmount

Avoid floating-point data types for financial calculations.

---

## Date Handling

Use:

DateTime

for timestamps.

Use:

Date

(where appropriate through Prisma mapping)

for business dates such as:

- attendanceDate
- sessionDate
- transactionDate
- effectiveDate

Store all timestamps in UTC.

Display them in the user's local timezone at the application layer.

---

## Soft Delete Implementation

Every repository query should automatically filter:

isActive = true

Administrative reporting modules may explicitly include inactive records when required.

---

## Transactions

Use Prisma Transactions for operations affecting multiple tables.

Examples:

Student Promotion

- Update Student
- Insert MarhalaHistory

Fee Payment

- Insert FeePaymentTransaction
- Update StudentFeeCollection

Settlement Generation

- Create MonthlySettlement
- Create MonthlySettlementDetail records
- Apply SettlementAdjustments (if any)

Each workflow must be atomic to maintain data consistency.

---

# 11. Future Database Expansion

The schema has been designed to support future enhancements without structural redesign.

Potential future modules include:

Academic

- Examination
- Assessment
- Certificates

Finance

- Fee Receipts
- Expense Management
- Payout History
- Bank Transfers

Communication

- Push Notifications
- SMS Integration
- WhatsApp Notifications

Student Portal

- Student Login
- Parent Login
- Progress Tracking
- Attendance History

Administration

- Role-Based Access Control (RBAC)
- Multi-Branch Support
- Multi-Institute Support

Media

- Student Documents
- Audio Recordings
- Assignment Attachments

Analytics

- Attendance Trends
- Marhala Performance
- Fee Collection Trends
- Huffaz Performance Dashboard

The current schema provides a scalable foundation that allows these modules to be introduced through additional entities while preserving backward compatibility.

---

# Database Design Summary

## Design Principles

- Domain-Driven Design
- Historical Data Preservation
- Normalized Relational Schema
- Soft Delete Strategy
- Audit-First Approach
- Configurable Business Rules
- Monthly Financial Integrity

---

## Core Modules

- Authentication
- Academic
- Student
- Quran Journey
- Attendance
- Finance
- Monthly Settlement
- System

---

## Core Business Rules

- Huffaz are represented through the User entity.
- Students are never permanently assigned to a Huffaz.
- Every Quran Session is an independent historical record.
- Every operational record belongs to an Academic Month.
- Every Academic Month belongs to an Academic Period.
- Fee configurations are versioned by Academic Period.
- Student fees are managed using monthly summaries and payment transactions.
- Monthly settlements are generated after month completion and become immutable once locked.
- Financial calculations are based only on actual amounts received.

---

## Implementation Readiness

This database design is now complete and serves as the authoritative blueprint for:

- Prisma Schema
- PostgreSQL Database
- REST API Development
- Business Logic Implementation
- React Native Application Development
- Reporting & Dashboard Modules

Any implementation should adhere to this document to ensure consistency across the entire system architecture.
