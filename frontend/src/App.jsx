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

// Citizen
import CitizenDashboard from "./pages/citizen/CitizenDashboard";
import TakeToken from "./pages/citizen/TakeToken";
import MyAppointments from "./pages/citizen/MyAppointments";
import LiveQueue from "./pages/citizen/LiveQueue";

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
            <Route path="/display" element={<PublicQueueDisplay />} />
            <Route path="/display/:departmentId" element={<PublicQueueDisplay />} />

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
