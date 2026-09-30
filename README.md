# Smart Government Queue Management System (Taluk Office)

A modern, transparent, paperless Queue and Appointment Management System designed for Taluk Administrative Offices (e-Seva centers, Revenue Departments, Certificate Desks, and Social Welfare Services).

---

## 🌟 Key Features

### 👤 Citizen Portal
- **Walk-in Token Generation:** Select a department and service to receive an immediate token number (e.g. `REV001`).
- **Live Queue Tracking:** View real-time queue position (`peopleAhead`) and calculated wait time (`estimatedWaitTime = peopleAhead × avgServiceTime`).
- **Advance Appointment Booking:** Schedule visits for upcoming dates with time slots.
- **Appointment Check-in:** On appointment day, check in with one click to transition the appointment directly into the active token queue.
- **My Active Token:** Live status card with automated alerts when your token is called.

### 💼 Officer Desk
- **Assigned Counter Workflow:** Automatically syncs with officer's assigned counter desk (e.g., `Revenue Counter 1`).
- **Token Call Sequence:**
  1. **CALL NEXT:** Announces next citizen in FIFO queue order (status: `waiting` → `called`).
  2. **START SERVICE:** Starts processing the citizen (status: `called` → `serving`).
  3. **COMPLETE SERVICE:** Concludes the case (status: `serving` → `completed`), automatically resolves appointment if linked, and marks the desk ready for the next citizen.
  4. **SKIP TOKEN:** Handles citizen no-show (status: `called`/`serving` → `skipped`).
- **Availability Toggle:** Easily switch between `Available` and `Unavailable` status.
- **Live Department Queue View:** Real-time table of all citizens waiting in the department.

### 🛡️ Admin Console
- **Analytics Dashboard:** Live metrics cards (Total Citizens, Officers, Departments, Services, Counters, Today's Tokens, Waiting, Serving, Completed).
- **Department Management:** Full CRUD operations for Taluk departments with unique codes (e.g. `REV`, `ADM`, `WEL`, `CERT`).
- **Service Management:** CRUD operations with configurable average service times in minutes.
- **Revenue Officer Management:** Create officer profiles along with login accounts, edit designations, and deactivate accounts.
- **Counter Desk Management:** Create counters, assign/reassign officers, and monitor desk status.
- **Appointments Overview:** View, filter, and track all citizen appointment bookings.

### 📺 Public Queue Display Screen (Waiting Hall TV)
- Full-screen high-contrast display for waiting hall TV screens (`/display` or `/display/:departmentId`).
- Shows **NOW SERVING**, **COUNTER NUMBER**, **NOW CALLED**, **NEXT IN LINE**, and **AVERAGE WAIT TIME**.
- Sound chime notification whenever a token is called.
- No citizen phone numbers or private data exposed.

---

## 🛠️ Technology Stack

- **Backend:** Node.js, Express.js 5, MongoDB Atlas, Mongoose 9
- **Authentication:** JWT (JSON Web Tokens) with role-based access control, bcryptjs password hashing
- **Real-Time Synchronization:** Socket.IO with automatic department room broadcasting & polling fallback
- **Frontend:** React 18, Vite 6, React Router 7, Axios, Lucide React icons, Tailwind CSS 3

---

## 📂 Project Structure

```
smart-government-queue-system/
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js                # MongoDB Atlas connection
│   │   ├── controllers/
│   │   │   ├── adminController.js
│   │   │   ├── appointmentController.js
│   │   │   ├── authController.js
│   │   │   ├── citizenController.js
│   │   │   ├── counterController.js
│   │   │   ├── departmentController.js
│   │   │   ├── officerController.js
│   │   │   ├── serviceController.js
│   │   │   └── tokenController.js
│   │   ├── middleware/
│   │   │   └── authMiddleware.js    # protect & authorize middlewares
│   │   ├── models/
│   │   │   ├── Appointment.js
│   │   │   ├── Counter.js
│   │   │   ├── Department.js
│   │   │   ├── Officer.js
│   │   │   ├── Service.js
│   │   │   ├── Token.js
│   │   │   └── User.js
│   │   ├── routes/
│   │   │   ├── adminRoutes.js
│   │   │   ├── appointmentRoutes.js
│   │   │   ├── authRoutes.js
│   │   │   ├── citizenRoutes.js
│   │   │   ├── counterRoutes.js
│   │   │   ├── departmentRoutes.js
│   │   │   ├── officerRoutes.js
│   │   │   ├── serviceRoutes.js
│   │   │   └── tokenRoutes.js
│   │   ├── sockets/
│   │   │   └── socket.js            # Socket.IO server & event broadcaster
│   │   ├── utils/
│   │   │   └── generateToken.js     # JWT generator
│   │   ├── app.js                   # Express application setup & error handlers
│   │   ├── seed.js                  # Idempotent DB seeding script
│   │   └── server.js                # HTTP server & socket initialization
│   ├── .env                         # Environment variables (Atlas URI, JWT Secret)
│   ├── .env.example
│   ├── package.json
│   └── test_api.js                  # 25-step backend test suite
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Footer.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   └── StatusBadge.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx      # Auth state & token persistence
│   │   ├── pages/
│   │   │   ├── admin/
│   │   │   │   └── AdminDashboard.jsx
│   │   │   ├── citizen/
│   │   │   │   ├── CitizenDashboard.jsx
│   │   │   │   ├── LiveQueue.jsx
│   │   │   │   ├── MyAppointments.jsx
│   │   │   │   └── TakeToken.jsx
│   │   │   ├── officer/
│   │   │   │   └── OfficerDashboard.jsx
│   │   │   ├── Home.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── PublicQueueDisplay.jsx
│   │   │   └── Register.jsx
│   │   ├── services/
│   │   │   ├── api.js               # Axios instance with all backend APIs
│   │   │   └── socket.js            # Socket.IO client
│   │   ├── App.jsx                  # Main router setup
│   │   ├── index.css                # Tailwind directives & styles
│   │   └── main.jsx
│   ├── .env.example
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
│
├── API_DOCUMENTATION.md             # Complete API specification
├── README.md
└── .gitignore
```

---

## 🔑 Test Accounts (Ready to use)

| Role | Email | Password | Details |
|---|---|---|---|
| **Admin** | `admin@talukoffice.com` | `admin123` | Full access to console, departments, services, officers, counters |
| **Officer** | `officer@test.com` | `officer123` | Employee ID: `OFF002`, Revenue Officer, Assigned to Counter #1 |
| **Citizen** | `barathnew@gmail.com` | *(or register any)* | Citizen booking & token generation |

*Note: On the login screen, clicking the **Admin** or **Officer** tab automatically populates the test credentials for one-click access.*

---

## 🚦 Token State Machine

The queue strictly enforces sequential status transitions:

```
[Walk-in / Check-in] 
        ↓
    waiting
        ↓
      called  ──(skip)──→  skipped
        ↓
     serving  ──(skip)──→  skipped
        ↓
    completed
```

- Invalid transitions (e.g. `completed` → `serving`, `skipped` → `called`, `waiting` → `completed`) are rejected by controller validations.

---

## 🚀 Getting Started

### 1. Backend Setup

```bash
cd backend
npm install
```

Ensure `.env` contains:
```env
PORT=5000
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_jwt_secret_key
```

Seed the database (idempotent; will not duplicate existing records):
```bash
node src/seed.js
```

Run test suite:
```bash
node test_api.js
```

Start the backend server:
```bash
npm run dev
# Or production mode:
npm start
```
*Backend runs on `http://localhost:5000`.*

---

### 2. Frontend Setup

```bash
cd ../frontend
npm install
```

Start the Vite development server:
```bash
npm run dev
```
*Frontend runs on `http://localhost:3000`.*

---

## 🧪 Verified Test Suite

The backend contains a 25-step automated integration test suite in `backend/test_api.js`:
- ✅ Root health check
- ✅ Admin login
- ✅ Officer login
- ✅ Citizen registration & profile
- ✅ Department & Service listings
- ✅ Walk-in token generation (`REV001`)
- ✅ Citizen active token calculation (`peopleAhead`, `estimatedWaitTime`)
- ✅ Public waiting hall screen (safe data filter)
- ✅ Officer dashboard metrics
- ✅ Call next waiting token (`waiting` → `called`)
- ✅ Start service (`called` → `serving`)
- ✅ Complete service (`serving` → `completed`)
- ✅ Advance appointment booking
- ✅ Appointment check-in (`booked` → `checked_in` + token issued)
- ✅ Officer skip token (`called` → `skipped`)
- ✅ Admin dashboard statistics
- ✅ Role-based authorization & security rejection (401, 403)
