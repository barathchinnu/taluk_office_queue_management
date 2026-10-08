import React from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { LanguageProvider } from "./context/LanguageContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

// Pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import PublicQueueDisplay from "./pages/PublicQueueDisplay";
import ServiceCatalog from "./pages/ServiceCatalog";
import TrackStatus from "./pages/TrackStatus";
import Notifications from "./pages/Notifications";

// Citizen
import CitizenDashboard from "./pages/citizen/CitizenDashboard";
import TakeToken from "./pages/citizen/TakeToken";
import MyAppointments from "./pages/citizen/MyAppointments";
import LiveQueue from "./pages/citizen/LiveQueue";
import ApplyService from "./pages/citizen/ApplyService";
import MyApplications from "./pages/citizen/MyApplications";

// Officer
import OfficerDashboard from "./pages/officer/OfficerDashboard";

// Admin
import AdminDashboard from "./pages/admin/AdminDashboard";

const Layout = ({ children }) => {
  const location = useLocation();
  const isDisplayScreen = location.pathname.startsWith("/display");

  if (isDisplayScreen) {
    return <main>{children}</main>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <BrowserRouter>
          <Layout>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/services" element={<ServiceCatalog />} />
              <Route path="/track" element={<TrackStatus />} />
              <Route path="/display" element={<PublicQueueDisplay />} />
              <Route path="/display/:departmentId" element={<PublicQueueDisplay />} />

              {/* Shared Authenticated Routes */}
              <Route
                path="/notifications"
                element={
                  <ProtectedRoute allowedRoles={["citizen", "officer", "admin"]}>
                    <Notifications />
                  </ProtectedRoute>
                }
              />

              {/* Citizen Protected Routes */}
              <Route
                path="/citizen"
                element={
                  <ProtectedRoute allowedRoles={["citizen"]}>
                    <CitizenDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/citizen/take-token"
                element={
                  <ProtectedRoute allowedRoles={["citizen"]}>
                    <TakeToken />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/citizen/apply"
                element={
                  <ProtectedRoute allowedRoles={["citizen"]}>
                    <ApplyService />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/citizen/applications"
                element={
                  <ProtectedRoute allowedRoles={["citizen"]}>
                    <MyApplications />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/citizen/appointments"
                element={
                  <ProtectedRoute allowedRoles={["citizen"]}>
                    <MyAppointments />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/citizen/queue"
                element={
                  <ProtectedRoute allowedRoles={["citizen", "officer", "admin"]}>
                    <LiveQueue />
                  </ProtectedRoute>
                }
              />

              {/* Officer Protected Routes */}
              <Route
                path="/officer"
                element={
                  <ProtectedRoute allowedRoles={["officer", "admin"]}>
                    <OfficerDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/officer/queue"
                element={
                  <ProtectedRoute allowedRoles={["officer", "admin"]}>
                    <LiveQueue />
                  </ProtectedRoute>
                }
              />

              {/* Admin Protected Routes */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Catch-all Fallback */}
              <Route path="*" element={<Home />} />
            </Routes>
          </Layout>
        </BrowserRouter>
      </LanguageProvider>
    </AuthProvider>
  );
}

export default App;
