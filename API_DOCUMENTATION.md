# Smart Government Queue Management System — API Documentation

This document describes all REST API endpoints available in the Smart Government Queue Management System for a Taluk Office.

---

## 1. Authentication Endpoints (`/api/auth`)

### 1.1 Register User
- **Method:** `POST`
- **URL:** `/api/auth/register`
- **Authentication:** None
- **Request Body:**
  ```json
  {
    "fullName": "Barath Kumar",
    "email": "barath@example.com",
    "phone": "9876543210",
    "password": "password123",
    "role": "citizen"
  }
  ```
- **Response (201 Created):**
  ```json
  {
    "success": true,
    "message": "Registration Successful",
    "token": "JWT_TOKEN_HERE",
    "user": {
      "id": "6a5cd...",
      "fullName": "Barath Kumar",
      "email": "barath@example.com",
      "phone": "9876543210",
      "role": "citizen"
    }
  }
  ```
- **Purpose:** Registers a citizen or officer and returns an authentication JWT.

### 1.2 Login User
- **Method:** `POST`
- **URL:** `/api/auth/login`
- **Authentication:** None
- **Request Body:**
  ```json
  {
    "email": "admin@talukoffice.com",
    "password": "admin123"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Login successful",
    "token": "JWT_TOKEN_HERE",
    "user": {
      "id": "6aba8...",
      "fullName": "Taluk Administrator",
      "email": "admin@talukoffice.com",
      "phone": "9876543210",
      "role": "admin"
    }
  }
  ```
- **Purpose:** Authenticates user and returns JWT token.

---

## 2. Token & Queue Endpoints (`/api/tokens`)

### 2.1 Generate Walk-in Token
- **Method:** `POST`
- **URL:** `/api/tokens`
- **Authentication:** Bearer JWT (`citizen` or `admin`)
- **Request Body:**
  ```json
  {
    "department": "6ab6aa5bb3f96ece19890971",
    "service": "6ab6b0dd02be36a5838574c4"
  }
  ```
- **Response (201 Created):**
  ```json
  {
    "success": true,
    "message": "Token generated successfully",
    "token": {
      "_id": "6aba...",
      "tokenNumber": 1,
      "tokenDisplay": "REV001",
      "citizen": { ... },
      "department": { "name": "Revenue", "code": "REV" },
      "service": { "name": "Income Certificate", "averageServiceTime": 10 },
      "status": "waiting",
      "queueDate": "2026-09-30T..."
    }
  }
  ```
- **Purpose:** Generates a daily sequential token for a walk-in citizen. Emits `tokenCreated` via Socket.IO.

### 2.2 Get Citizen's Active Token
- **Method:** `GET`
- **URL:** `/api/tokens/my-token`
- **Authentication:** Bearer JWT (`citizen`)
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "token": {
      "_id": "6aba...",
      "tokenNumber": 2,
      "tokenDisplay": "REV002",
      "status": "waiting",
      "department": { "name": "Revenue", "code": "REV" },
      "service": { "name": "Income Certificate", "averageServiceTime": 10 },
      "counter": null,
      "peopleAhead": 1,
      "estimatedWaitTime": 10
    }
  }
  ```
- **Purpose:** Retrieves active token with calculated queue position (`peopleAhead`) and estimated wait time (`peopleAhead × averageServiceTime`).

### 2.3 Get Department Queue
- **Method:** `GET`
- **URL:** `/api/tokens/queue/:departmentId`
- **Authentication:** None / Optional
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "count": 5,
    "currentToken": "REV001",
    "currentlyServing": { ... },
    "currentlyCalled": { ... },
    "waitingCount": 3,
    "queue": [ ... ]
  }
  ```
- **Purpose:** Returns active tokens for a department today.

### 2.4 Public Queue Display Screen (Safe)
- **Method:** `GET`
- **URL:** `/api/tokens/public/queue/:departmentId`
- **Authentication:** None (Public)
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "department": { "name": "Revenue", "code": "REV" },
    "nowServing": [
      {
        "tokenDisplay": "REV001",
        "counterNumber": 1,
        "counterName": "Revenue Counter 1",
        "serviceName": "Income Certificate"
      }
    ],
    "nowCalled": [],
    "nextTokens": [
      { "tokenDisplay": "REV002", "serviceName": "Income Certificate" },
      { "tokenDisplay": "REV003", "serviceName": "Patta Related Service" }
    ],
    "waitingCount": 2,
    "estimatedWaitMinutes": 20
  }
  ```
- **Purpose:** Feeds waiting hall TV screens. Does not expose private citizen contact info.

### 2.5 Call Next Waiting Token
- **Method:** `POST`
- **URL:** `/api/tokens/call-next`
- **Authentication:** Bearer JWT (`officer`, `admin`)
- **Request Body:** `{}`
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Token called successfully",
    "token": {
      "tokenDisplay": "REV001",
      "status": "called",
      "counter": { "counterNumber": 1, "name": "Revenue Counter 1" }
    }
  }
  ```
- **Purpose:** Officer calls the first waiting token in department queue. Status changes: `waiting` → `called`. Emits `tokenCalled`.

### 2.6 Start Service
- **Method:** `POST`
- **URL:** `/api/tokens/:id/start`
- **Authentication:** Bearer JWT (`officer`, `admin`)
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Service started successfully",
    "token": { "status": "serving", "servingAt": "..." }
  }
  ```
- **Purpose:** Changes token state: `called` → `serving`. Emits `serviceStarted`.

### 2.7 Complete Service
- **Method:** `POST`
- **URL:** `/api/tokens/:id/complete`
- **Authentication:** Bearer JWT (`officer`, `admin`)
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Service completed successfully",
    "token": { "status": "completed", "completedAt": "..." }
  }
  ```
- **Purpose:** Changes token state: `serving` → `completed`. If linked to appointment, updates appointment to `completed`. Emits `serviceCompleted`.

### 2.8 Skip / No-Show Token
- **Method:** `POST`
- **URL:** `/api/tokens/:id/skip`
- **Authentication:** Bearer JWT (`officer`, `admin`)
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Token marked as skipped",
    "token": { "status": "skipped", "cancelledAt": "..." }
  }
  ```
- **Purpose:** Skips no-show citizen: `called` or `serving` → `skipped`. Emits `tokenSkipped`.

---

## 3. Appointment Endpoints (`/api/appointments`)

### 3.1 Book Advance Appointment
- **Method:** `POST`
- **URL:** `/api/appointments`
- **Authentication:** Bearer JWT (`citizen`, `admin`)
- **Request Body:**
  ```json
  {
    "department": "DEPARTMENT_ID",
    "service": "SERVICE_ID",
    "appointmentDate": "2026-10-01",
    "appointmentTime": "11:30 AM",
    "purpose": "Income certificate application verification"
  }
  ```
- **Response (201 Created):**
  ```json
  {
    "success": true,
    "message": "Appointment booked successfully",
    "appointment": { ... }
  }
  ```

### 3.2 Get My Appointments
- **Method:** `GET`
- **URL:** `/api/appointments/my`
- **Authentication:** Bearer JWT (`citizen`)
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "count": 2,
    "appointments": [ ... ]
  }
  ```

### 3.3 Appointment Check-in → Token Generation
- **Method:** `POST`
- **URL:** `/api/appointments/:id/check-in`
- **Authentication:** Bearer JWT (`citizen`, `admin`)
- **Response (201 Created):**
  ```json
  {
    "success": true,
    "message": "Check-in successful. Token generated!",
    "token": {
      "tokenDisplay": "REV003",
      "status": "waiting",
      "appointment": "APPOINTMENT_ID"
    }
  }
  ```
- **Purpose:** On the day of appointment, citizen checks in, converting appointment to an active waiting token.

### 3.4 Cancel Appointment
- **Method:** `PUT` or `PATCH`
- **URL:** `/api/appointments/:id/cancel`
- **Authentication:** Bearer JWT (`citizen`, `admin`)
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Appointment cancelled successfully"
  }
  ```

---

## 4. Officer Endpoints (`/api/officers`)

### 4.1 Officer Dashboard
- **Method:** `GET`
- **URL:** `/api/officers/dashboard`
- **Authentication:** Bearer JWT (`officer`, `admin`)
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "dashboard": {
      "officer": { ... },
      "counter": { "counterNumber": 1, "name": "Revenue Counter 1" },
      "currentToken": { ... },
      "waitingCount": 3,
      "completedCount": 8
    }
  }
  ```

### 4.2 Toggle Officer Availability
- **Method:** `POST`
- **URL:** `/api/officers/availability`
- **Authentication:** Bearer JWT (`officer`, `admin`)
- **Request Body:** `{ "isAvailable": true }`
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Availability updated to Available",
    "isAvailable": true
  }
  ```

---

## 5. Counter Management Endpoints (`/api/counters`)

- `GET /api/counters`: List active counters with assigned officers and departments.
- `GET /api/counters/:id`: Get single counter details.
- `POST /api/counters`: Create new counter (Admin only).
- `PUT /api/counters/:id`: Update counter details (Admin only).
- `DELETE /api/counters/:id`: Deactivate counter (Admin only).
- `POST /api/counters/:id/assign-officer`: Assign officer to counter `{ "officerId": "..." }` (Admin only).
- `POST /api/counters/:id/remove-officer`: Remove assigned officer (Admin only).

---

## 6. Administration Endpoints (`/api/admin`)

- `GET /api/admin/dashboard`: Metrics cards (Citizens, Officers, Departments, Services, Counters, Today Tokens, Waiting, Serving, Completed).
- `GET /api/admin/officers`: List all officers with user account info and desk assignment.
- `POST /api/admin/officers`: Create officer profile and user login account simultaneously.
- `PUT /api/admin/officers/:id`: Update officer profile.
- `DELETE /api/admin/officers/:id`: Deactivate officer.
- `GET /api/admin/departments`: List all departments (including inactive).
- `POST /api/admin/departments`: Create department.
- `PUT /api/admin/departments/:id`: Update department.
- `DELETE /api/admin/departments/:id`: Deactivate department.
- `GET /api/admin/services`: List all services.
- `POST /api/admin/services`: Create service.
- `PUT /api/admin/services/:id`: Update service.
- `DELETE /api/admin/services/:id`: Deactivate service.
- `GET /api/admin/appointments`: Overview of all appointments with department/status filters.

---

## 7. Socket.IO Real-time Events

| Event Name | Direction | Payload | Description |
|---|---|---|---|
| `joinDepartment` | Client → Server | `departmentId` | Joins room for department-level updates |
| `leaveDepartment` | Client → Server | `departmentId` | Leaves room |
| `tokenCreated` | Server → Client | `token` object | New walk-in or checked-in token |
| `tokenCalled` | Server → Client | `token` object | Token called to an officer's counter |
| `serviceStarted` | Server → Client | `token` object | Officer started service |
| `serviceCompleted` | Server → Client | `token` object | Service completed |
| `tokenSkipped` | Server → Client | `token` object | Token skipped / no-show |
| `queueUpdated` | Server → Client | `{ departmentId, timestamp }` | Queue metrics updated |
