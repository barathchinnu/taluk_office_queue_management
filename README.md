# Smart Government Service & Queue Management Platform — Taluk Office

A production-grade, multi-tiered digital government service platform built for **Taluk Offices, Revenue Departments, Certificate Desks, Social Welfare Centers, and Aadhaar Seva Kendras**.

The platform provides end-to-end service orchestration:
```
Government Office
       ↓
   Department
       ↓
    Service
       ↓
Appointment / Walk-in
       ↓
     Token (Normal FIFO / Senior Citizen / Differently-Abled / Emergency)
       ↓
     Queue
       ↓
    Counter
       ↓
    Officer Desk
       ↓
Application Scrutiny & Document Verification
       ↓
Service Completion
       ↓
Citizen Feedback & Rating (1–5 Stars)
       ↓
Omni-Channel Notifications (In-App, Email, SMS, WebSockets)
```

---

## 🌟 Architecture & Core Capabilities

### 🏢 1. Scalable Government Office Hierarchy (`Phase 1 & 3`)
- Multi-office extensible data model (`GovernmentOffice`) supporting:
  - **Taluk Administrative Offices**
  - **Revenue Department Offices**
  - **Sub-Registrar Offices**
  - **Social Welfare Desks**
  - **UIDAI Aadhaar Centers**
  - **Municipal Corporations & Citizen Service Centres (CSC)**
- Office metadata: jurisdiction code, working hours, district/taluk identifiers, official contact information.
- Full backward-compatibility: defaults to Taluk Headquarters office without breaking existing departments or counters.

### 🔔 2. Omni-Channel Notification Engine & Citizen Center (`Phase 5 & 6`)
- Real-time in-app WebSocket notification delivery via dedicated user rooms (`user_${id}`).
- Nodemailer SMTP email integration with automatic mock fallback logger.
- Abstracted SMS delivery provider for zero-cost local test execution.
- Dedicated **Citizen Notification Center** (`/notifications`):
  - Interactive notification bell in Navbar with live unread badges.
  - Dropdown preview with quick navigation to tokens, appointments, or applications.
  - Mark as read, mark all as read, delete notification, and category filtering.
- Automated system notification triggers:
  - `TOKEN_GENERATED`, `TOKEN_NEAR` (when 1 or 2 citizens ahead), `TOKEN_CALLED`, `SERVICE_STARTED`, `SERVICE_COMPLETED`
  - `APPOINTMENT_BOOKED`, `APPOINTMENT_CONFIRMED`, `APPOINTMENT_CANCELLED`
  - `APPLICATION_SUBMITTED`, `DOCUMENT_VERIFICATION`, `APPLICATION_APPROVED`, `APPLICATION_REJECTED`

### ⚡ 3. Intelligent Priority Queue System (`Phase 7, 8 & 9`)
- Categorized citizen prioritization:
  - `NORMAL` (Standard FIFO)
  - `SENIOR_CITIZEN` (60+ years)
  - `DISABILITY` (Person with Disability - PwD)
  - `PREGNANT` (Pregnant Women / Nursing Mothers)
  - `EMERGENCY` (Authorized Urgent Priority)
- Controlled Verification Policy: Prevents unrestricted self-selection; priority tokens require officer verification (`PATCH /api/tokens/:id/verify-priority`) before hopping the queue.
- Dynamic wait-time computation: `estimatedWaitTime = peopleAhead × service.averageServiceTime`.

### 📑 4. Citizen Service Catalog & Prerequisites (`Phase 17`)
- Comprehensive public directory (`/services`) with real-time keyword search and department filters.
- Detailed citizen charter per service:
  - Prerequisite document checklist (e.g. Sale Deed, TC, Ration Card).
  - Expected SLA processing days (e.g. 3 days for Income Certificate).
  - Official government fee (Free vs. ₹50 / ₹60).
  - Instant action buttons: **Walk-in Token**, **Apply Online**, or **Book Appointment**.

### 📝 5. Digital Application Workflow & Document Scrutiny (`Phase 11 & 12`)
- Online application submission portal (`/citizen/apply`).
- Multer multi-part document management supporting PDF and image uploads up to 10MB.
- Application status life cycle:
  `DRAFT → SUBMITTED → DOCUMENT_VERIFICATION → OFFICER_REVIEW → ADDITIONAL_INFO_REQUIRED → APPROVED / REJECTED → COMPLETED`.
- Officer Document Scrutiny panel:
  - Inspect uploaded proofs inline or via secure download.
  - Mark individual documents as `VERIFIED`, `REJECTED`, or `REUPLOAD_REQUIRED`.
  - Approve or reject applications with official remarks and citizen alerts.

### 🔍 6. Public Tracking & Stepper Status (`Phase 19`)
- Public tracking page (`/track`) requiring no login.
- Search by Application Number (`APP-2026-XXXXXX`) or Token Code (`REV001`).
- Visual progress stepper with status badges, updated timestamp, and next recommended citizen actions.

### ⭐ 7. Citizen Feedback & Satisfaction Analytics (`Phase 18`)
- Interactive 5-star rating modal with comment submission upon service completion.
- Admin satisfaction analytics dashboard:
  - Overall average rating score (e.g., `4.9 / 5.0`).
  - Star breakdown distribution (5★ through 1★).
  - Department and service quality rankings.
  - Recent citizen feedback comments feed.

### 💼 8. Officer Desk & Counter Controls (`Phase 13 & 14`)
- Counter availability toggle (Available / Unavailable / Busy).
- One-click workflow controls: `CALL NEXT TOKEN`, `START SERVICE`, `COMPLETE SERVICE`, `SKIP / NO-SHOW`.
- Integrated **Applications & Scrutiny** desk to review documents without leaving the dashboard.
- Live department waiting list with priority verification badges.

### 🛡️ 9. Admin Console & Analytics (`Phase 15`)
- Live KPI cards: Total Citizens, Officers, Departments, Services, Counters, Today's Appointments, Tokens.
- Department, Service, Officer, and Counter management.
- Government Offices directory tab.
- Applications audit log.
- Feedback analytics and ratings breakdown.

### 📺 10. Public Waiting Hall Display (`Phase 16`)
- Full-screen high-contrast display for waiting hall TV monitors (`/display`).
- Sound chime notification whenever a token is called.
- High-privacy mode: No citizen phone numbers or private data exposed.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Backend** | Node.js, Express.js 5, MongoDB Atlas, Mongoose 9, Multer, Nodemailer, bcryptjs, JWT |
| **Real-Time** | Socket.IO 4 (User rooms, Department rooms, Office rooms) |
| **Frontend** | React 18, Vite 6, React Router 7, Axios, Lucide React, Tailwind CSS 3 |
| **Localization** | Dual Language Engine: Tamil (தமிழ்) & English |

---

## 🔑 Demo Credentials

| Role | Email | Password | Assigned Counter |
|---|---|---|---|
| **Administrator** | `admin@talukoffice.com` | `admin123` | Admin Console Access |
| **Revenue Officer** | `officer@test.com` | `officer123` | Revenue Counter 1 (OFF002) |
| **Aadhaar Officer** | `aadhaar@talukoffice.com` | `officer123` | Aadhaar Kendra Counter 5 (UID001) |
| **Citizen (Arun Kumar)** | `citizen@test.com` | `citizen123` | Citizen Portal & Tracking |

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- Node.js (v18+ recommended)
- MongoDB Atlas URI or local MongoDB connection

### 2. Backend Setup
```bash
cd backend
npm install
```

Create or verify `.env` file in `backend/`:
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
NODE_ENV=development
```

Seed initial administrative data, office hierarchy, departments, services, and demo accounts:
```bash
node src/seed.js
```

Start the backend server:
```bash
npm run dev
```
Backend runs at: `http://localhost:5000`

### 3. Frontend Setup
```bash
cd ../frontend
npm install
npm run dev
```
Frontend runs at: `http://localhost:3000`

### 4. Run Automated E2E Platform Verification
In `backend/`:
```bash
node test_all_workflows.js
```
Executes 13 automated tests verifying auth, priority queue, application tracking, notifications, feedback, and analytics.

---

## 📡 Socket.IO Real-Time Events

| Event Name | Direction | Payload | Description |
|---|---|---|---|
| `joinUser` | Client → Server | `userId` | Joins private user room `user_${userId}` |
| `notification:new` | Server → Client | `Notification` | Emitted when citizen receives alert |
| `joinDepartment` | Client → Server | `deptId` | Joins room `department_${deptId}` |
| `token:generated` | Server → Client | `Token` | New token generated in queue |
| `token:called` | Server → Client | `Token` | Token called to counter |
| `token:serving` | Server → Client | `Token` | Service started |
| `token:completed` | Server → Client | `Token` | Service completed |
| `token:skipped` | Server → Client | `Token` | Citizen marked no-show |
| `queue:updated` | Server → Client | `{ departmentId }` | Triggers UI refresh |

---

## 📄 License & Attribution
Developed as an advanced CSE Full-Stack Capstone Project for Smart Governance Digital Transformation.
