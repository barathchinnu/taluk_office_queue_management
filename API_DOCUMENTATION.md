# Smart Government Service Platform — Complete API Documentation

This document describes all REST API endpoints available in the Smart Government Service & Queue Management System.

---

## 1. Authentication Endpoints (`/api/auth`)

### 1.1 Register User
- **Method:** `POST`
- **URL:** `/api/auth/register`
- **Authentication:** None
- **Request Body:**
  ```json
  {
    "fullName": "Arun Kumar",
    "email": "arun@example.com",
    "phone": "9876543210",
    "password": "password123",
    "role": "citizen"
  }
  ```
- **Response (201 Created):** Returns user profile and JWT authorization token.

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
- **Response (200 OK):** Returns user profile and JWT authorization token.

---

## 2. Government Office Endpoints (`/api/offices`)

### 2.1 Get All Government Offices
- **Method:** `GET`
- **URL:** `/api/offices`
- **Query Params:** `all=true` (optional, default: only active offices)
- **Authentication:** Public
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "count": 1,
    "data": [
      {
        "_id": "67...a",
        "name": "Taluk Office - Kovilpatti",
        "code": "TALUK_HQ",
        "officeType": "taluk_office",
        "district": "Thoothukudi",
        "taluk": "Kovilpatti",
        "openingTime": "09:30 AM",
        "closingTime": "05:30 PM",
        "workingDays": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        "isActive": true
      }
    ]
  }
  ```

### 2.2 Create Government Office
- **Method:** `POST`
- **URL:** `/api/offices`
- **Authentication:** Bearer JWT (`admin`)
- **Request Body:**
  ```json
  {
    "name": "Sub-Registrar Office Kovilpatti",
    "code": "SRO_KVP",
    "officeType": "sub_registrar",
    "district": "Thoothukudi",
    "taluk": "Kovilpatti",
    "contactPhone": "04632-220200",
    "email": "sro.kvp@tn.gov.in"
  }
  ```

---

## 3. Citizen Service Catalog (`/api/service-catalog`)

### 3.1 Get Service Directory with Document Checklists
- **Method:** `GET`
- **URL:** `/api/service-catalog`
- **Query Params:** `department`, `office`, `search`
- **Authentication:** Public
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "count": 13,
    "data": [
      {
        "_id": "...",
        "name": "Income Certificate",
        "code": "REV_INC",
        "description": "Verification and processing of official family income certificate",
        "department": { "name": "Revenue", "code": "REV" },
        "fee": 60,
        "expectedProcessingDays": 3,
        "averageServiceTime": 10,
        "requiredDocuments": [
          "Aadhaar Card",
          "Salary Certificate / Pay Slip",
          "Ration Card",
          "Self Declaration Affidavit"
        ],
        "walkInAvailable": true,
        "appointmentAvailable": true,
        "priorityEligible": true
      }
    ]
  }
  ```

---

## 4. Priority Queue & Token Endpoints (`/api/tokens`)

### 4.1 Generate Walk-in Token with Priority Option
- **Method:** `POST`
- **URL:** `/api/tokens`
- **Authentication:** Bearer JWT (`citizen` or `admin`)
- **Request Body:**
  ```json
  {
    "department": "6ab6aa5bb3f96ece19890971",
    "service": "6ab6b0dd02be36a5838574c4",
    "priorityType": "SENIOR_CITIZEN"
  }
  ```
- **Response (201 Created):** Returns generated token (`REV001`), queue date, and initial state `waiting`.

### 4.2 Verify Token Priority Status
- **Method:** `PATCH`
- **URL:** `/api/tokens/:id/verify-priority`
- **Authentication:** Bearer JWT (`officer` or `admin`)
- **Request Body:**
  ```json
  {
    "priorityVerified": true,
    "priorityType": "SENIOR_CITIZEN"
  }
  ```
- **Purpose:** Verifies citizen priority proofs and immediately moves the token to the front of the department FIFO line.

### 4.3 Call Next Token
- **Method:** `POST`
- **URL:** `/api/tokens/call-next`
- **Authentication:** Bearer JWT (`officer`)
- **Purpose:** Calls the next verified priority or FIFO waiting citizen to the officer's counter. Emits `token:called` and sends SMS/in-app alert to citizen.

### 4.4 Start Service
- **Method:** `POST`
- **URL:** `/api/tokens/:id/start`
- **Authentication:** Bearer JWT (`officer`)
- **State Transition:** `called` → `serving`

### 4.5 Complete Service
- **Method:** `POST`
- **URL:** `/api/tokens/:id/complete`
- **Authentication:** Bearer JWT (`officer`)
- **State Transition:** `serving` → `completed`

### 4.6 Skip / No-show Token
- **Method:** `POST`
- **URL:** `/api/tokens/:id/skip`
- **Authentication:** Bearer JWT (`officer`)
- **State Transition:** `called`/`serving` → `skipped`

---

## 5. Digital Government Service Applications (`/api/applications`)

### 5.1 Create Service Application
- **Method:** `POST`
- **URL:** `/api/applications`
- **Authentication:** Bearer JWT (`citizen`)
- **Request Body:**
  ```json
  {
    "department": "6a...",
    "service": "6b...",
    "priorityType": "SENIOR_CITIZEN",
    "remarks": "Urgent submission for college scholarship admission"
  }
  ```
- **Response (201 Created):** Returns application document with unique tracking number (e.g. `APP-2026-000101`) and expected completion date SLA.

### 5.2 Upload Supporting Document (Multer)
- **Method:** `POST`
- **URL:** `/api/applications/:id/documents`
- **Authentication:** Bearer JWT (`citizen`, `officer`, `admin`)
- **Headers:** `Content-Type: multipart/form-data`
- **Form Data:**
  - `document`: Binary file (PDF, PNG, JPG - max 10MB)
  - `documentType`: string (e.g., "Ration Card", "Identity Proof")
- **Response (201 Created):** Stores document reference with `PENDING` verification status.

### 5.3 Public Tracking Endpoint
- **Method:** `GET`
- **URL:** `/api/applications/track/:query`
- **Authentication:** Public (no login needed)
- **Example Queries:**
  - `/api/applications/track/APP-2026-000101`
  - `/api/applications/track/REV001`
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "type": "application",
    "data": {
      "applicationNumber": "APP-2026-000101",
      "status": "DOCUMENT_VERIFICATION",
      "applicantName": "Arun Kumar",
      "department": { "name": "Revenue" },
      "service": { "name": "Income Certificate" },
      "expectedCompletionDate": "2026-10-10T..."
    }
  }
  ```

### 5.4 Update Application Status
- **Method:** `PATCH`
- **URL:** `/api/applications/:id/status`
- **Authentication:** Bearer JWT (`officer`, `admin`)
- **Request Body:**
  ```json
  {
    "status": "APPROVED",
    "remarks": "Documents verified by Revenue Inspector"
  }
  ```

### 5.5 Verify / Reject Document Attachment
- **Method:** `PATCH`
- **URL:** `/api/applications/documents/:docId/verify`
- **Authentication:** Bearer JWT (`officer`, `admin`)
- **Request Body:**
  ```json
  {
    "verificationStatus": "VERIFIED",
    "verificationRemarks": "Original verified"
  }
  ```

---

## 6. Citizen Notification Center (`/api/notifications`)

### 6.1 Get Citizen In-App Notifications
- **Method:** `GET`
- **URL:** `/api/notifications`
- **Authentication:** Bearer JWT (`citizen`, `officer`, `admin`)
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "unreadCount": 2,
    "data": {
      "notifications": [
        {
          "_id": "...",
          "title": "Token Called",
          "message": "Token REV001 called to Revenue Counter 1. Please proceed.",
          "type": "TOKEN_CALLED",
          "isRead": false,
          "sentAt": "2026-10-07T..."
        }
      ]
    }
  }
  ```

### 6.2 Mark Notification as Read
- **Method:** `PATCH`
- **URL:** `/api/notifications/:id/read`
- **Authentication:** Bearer JWT

### 6.3 Mark All as Read
- **Method:** `PATCH`
- **URL:** `/api/notifications/read-all`
- **Authentication:** Bearer JWT

---

## 7. Citizen Feedback & Satisfaction Analytics (`/api/feedback`)

### 7.1 Submit 5-Star Service Rating
- **Method:** `POST`
- **URL:** `/api/feedback`
- **Authentication:** Bearer JWT (`citizen`)
- **Request Body:**
  ```json
  {
    "rating": 5,
    "comment": "Prompt service and respectful counter officer.",
    "service": "6a...",
    "department": "6b...",
    "token": "6c..."
  }
  ```

### 7.2 Get Admin Satisfaction Analytics
- **Method:** `GET`
- **URL:** `/api/feedback/analytics`
- **Authentication:** Bearer JWT (`admin`)
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "totalFeedbacks": 42,
    "averageRating": 4.8,
    "breakdown": {
      "5": 35,
      "4": 5,
      "3": 2,
      "2": 0,
      "1": 0
    },
    "serviceStats": [ ... ],
    "recentFeedbacks": [ ... ]
  }
  ```
