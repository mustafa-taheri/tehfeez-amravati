# Quran Tehfeez Management System

## Software Requirements Specification (Phase 1 MVP)

Version: 1.0
Platform: Android
Application Type: Mobile Application
Development Approach: MVP (Minimum Viable Product)

---

# 1. Project Overview

The Quran Tehfeez Management System is an Android application designed to digitize and simplify the day-to-day activities of a Quran Tehfeez institute.

The application allows Huffaz (Quran Teachers) to manage students, record attendance, maintain each student's Quran learning journey, and view progress reports. The Admin is responsible for managing Huffaz accounts and monitoring institute-wide activities.

The objective of Phase 1 is to replace manual registers with a simple, reliable, and scalable digital solution.

---

# 2. Objectives

The primary objectives of the application are:

- Eliminate manual attendance registers.
- Digitally manage student information.
- Maintain complete Quran learning history for every student.
- Track daily progress of every student.
- Allow Admin to manage Huffaz.
- Generate basic reports and dashboards.
- Build a scalable foundation for future modules like salary calculation and notifications.

---

# 3. Technology Stack

## Mobile Application

- React Native (Expo)

## UI Components

- React Native Paper
- React Navigation
- React Hook Form

## Backend

- Node.js
- Express.js
- Prisma ORM
- JWT Authentication

## Database

- PostgreSQL

## Image Storage

- Cloudinary (Free Tier)

## Charts

- React Native Gifted Charts

## Deployment

Backend

- Railway / Render

Database

- Neon PostgreSQL

---

# 4. User Roles

## 4.1 Admin

Responsibilities

- Login
- Register Huffaz
- Update Huffaz Profile
- Delete Huffaz
- Mark Huffaz Attendance
- View Huffaz Attendance
- Manage Student Records
- View Student Attendance
- View Student Progress
- View Dashboard
- View Reports

Phase 1 supports a single Admin account.

Future versions may support multiple Admins with Role Based Access Control (RBAC).

---

## 4.2 Huffaz

Responsibilities

- Login
- Update Own Profile
- Mark Student Attendance
- Manage Students
- Update Quran Journey
- View Student Reports
- View Dashboard
- View Own Profile

---

# 5. Functional Requirements

## 5.1 Authentication

The system shall provide:

- Splash Screen
- Login Screen
- Username & Password Authentication
- JWT Based Authentication
- Logout
- Change Password
- Persistent Login Session

Only Admin and Huffaz can login.

Students cannot login during Phase 1.

---

## 5.2 Student Management

Huffaz and Admin shall be able to:

- Add Student
- Update Student
- Delete Student
- View Student List
- Search Student
- View Student Details

Student Information

- ITS Number
- Full Name
- Father Name
- Mobile Number
- Parent Mobile Number
- Address
- Date of Birth
- Admission Date
- Gender
- Photo
- Current Marhala
- Current Status

---

## 5.3 Student Attendance

Attendance can be marked once per day.

Attendance Status

- Present
- Absent
- Leave
- Uzur

Attendance cannot be modified once submitted.

Attendance history shall remain permanently available.

---

## 5.4 Huffaz Attendance

Only Admin can mark Huffaz attendance.

Attendance Status

- Present
- Absent
- Leave
- Half Day
- Uzur

Attendance history shall remain permanently available.

---

## 5.5 Quran Journey

Every teaching session shall be stored independently.

A student's Quran journey must never overwrite previous sessions.

Each Quran Session shall contain:

- Session Date
- Sipara Number
- Surah Name
- Starting Ayah
- Ending Ayah
- Hifz Progress
- Murajaah Juz
- Murajaah Marks
- Juz Haali Marks
- Jadeed Start Ayah
- Jadeed End Ayah
- Tasmee Marks
- Notes
- Updated By

This allows:

- Timeline View
- Performance Graph
- Complete Session History
- Historical Reports

---

## 5.6 Reports & Dashboard

### Dashboard

Display

- Total Students
- Students Present Today
- Students Absent Today
- Students on Leave
- Students with Uzur
- Students in each Marhala
- New Admissions
- Overall Attendance Percentage
- Overall Progress Percentage

---

### Individual Student Report

Display

- Student Profile
- Attendance History
- Quran Session Timeline
- Marhala History
- Notes
- Performance Graph
- Last Updated By

---

## 5.7 User Profile

Admin

- View Profile
- Change Password

Huffaz

- View Profile
- Update Profile Photo
- Change Password

---

## 5.8 Payable Amount Management

The system shall automatically calculate the payable amount for every Huffaz based on student fee collection and Huffaz attendance.

### Fee Configuration

Every Marhala shall have a monthly fee.

Example

| Marhala          | Monthly Fee |
| ---------------- | ----------- |
| Marhala Ula      | ₹600        |
| Marhala Saniyah  | ₹800        |
| Marhala Salesah  | ₹800        |
| Marhala Rabeah   | ₹800        |
| Marhala Khamesah | ₹800        |
| Marhala Sadesa   | ₹800        |

Future versions may allow Admin to change these values from the application.

---

### Monthly Collection

The system shall calculate

```
Total Monthly Collection

=

Sum of fees of all Active students
```

Only Active students shall be considered.

---

### Daily Pool Calculation

The system shall determine the daily payable pool.

Example

```
Monthly Collection

÷

Total Working Days

=

Daily Payable Pool
```

Working days shall be configurable in future versions.

For Phase 1 we may use calendar days or a configurable monthly working-day value.

---

### Huffaz Distribution

For each day

```
Daily Pool

÷

Number of Present Huffaz
```

Every Huffaz marked Present receives one equal share.

Attendance Status effect

| Status   | Eligible                 |
| -------- | ------------------------ |
| Present  | Yes                      |
| Half Day | 50% (configurable later) |
| Leave    | No                       |
| Absent   | No                       |
| Uzur     | No                       |

I suggest **Half Day = 50%** from day one.

---

### Monthly Payable Amount

Monthly payable amount shall be the sum of all daily earnings during the selected month.

Example

```
Day 1

₹1,200

+

Day 2

₹950

+

Day 3

₹1,100

...

=

Monthly Payable Amount
```

---

### Reports

Admin shall be able to view

- Monthly Collection
- Total Active Students
- Fee collected by Marhala
- Daily Pool Amount
- Individual Huffaz Payable Amount
- Attendance Summary
- Monthly Settlement Report

---

### Manual Adjustments

Admin may manually add

- Bonus
- Deduction
- Remarks

The system shall calculate

```
Final Payable Amount

=

Calculated Amount

+

Bonus

Deduction
```

---

## 5.9 Student Fee Collection

The system shall allow the Admin to manage monthly student fee collections.

Only the Admin can record, update, or verify student fee payments.

Every fee collection record shall belong to an Academic Month.

Each fee collection record shall contain:

- Student
- Academic Month
- Configured Fee
- Discount Amount
- Waived Amount
- Amount Received
- Payment Status
- Payment Date
- Payment Remarks
- Collected By

Payment Status

- Paid
- Partial Paid
- Unpaid
- Waived (Free Session)
- Discounted

Only the actual Amount Received shall be considered during payable amount calculation.

# 6. Student Lifecycle

The student lifecycle is as follows:

Admission

↓

Assigned to Marhala

↓

Daily Attendance

↓

Daily Quran Sessions

↓

Progress Evaluation

↓

Promotion to Next Marhala

↓

Completion / Shift / Discontinue

Only one Marhala remains active at any point.

Historical Quran sessions remain unchanged.

---

# 7. Student Status

Every student shall have one active status.

Available Status

- Active
- Completed
- Shifted
- Discontinued
- On Leave

---

# 8. Marhala Structure

The system shall support the following Marhalas.

- Marhala Ula
- Marhala Saniyah
- Marhala Salesah
- Marhala Rabeah
- Marhala Khamesah
- Marhala Sadesa

A student may be promoted between Marhalas.

The current Marhala becomes active.

Historical records remain preserved.

---

# 9. Future Scope

The following features are intentionally excluded from Phase 1.

## Notifications

- Attendance Reminder
- Student Absent Alert
- Report Generation Alert

---

## Multiple Admins

Support multiple Admin accounts with different permissions.

Examples

- Attendance Admin
- Academic Admin
- Super Admin

---

## Student Login Portal

Allow students to view:

- Attendance
- Quran Journey
- Reports

---

## Offline Support

Allow attendance without internet and synchronize later.

---

## iOS Support

Extend the application to Apple devices.

---

# 10. Academic Month

The application shall organize operational data using Academic Months.

Every Academic Month shall contain:

- Student Attendance
- Huffaz Attendance
- Quran Sessions
- Student Fee Collection
- Monthly Settlement

Academic Months shall have the following lifecycle:

Draft

↓

Generated

↓

Locked

Only Locked months shall be considered finalized.

# 11. Non Functional Requirements

Performance

- Screen loading under 2 seconds
- Dashboard loading under 3 seconds

Security

- JWT Authentication
- Password Hashing
- Protected APIs
- Secure Image Storage

Scalability

The architecture shall support future modules without major redesign.

Maintainability

The project shall follow modular architecture with clearly separated:

- Mobile Application
- Backend APIs
- Database Layer

Availability

The application requires an active internet connection during Phase 1.
