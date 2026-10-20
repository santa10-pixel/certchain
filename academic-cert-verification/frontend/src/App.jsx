import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

// Pages
import LandingPage from "./pages/LandingPage";
import AdminLoginPage from "./pages/AdminLoginPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import IssueCertificatePage from "./pages/IssueCertificatePage";
import CertificateListPage from "./pages/CertificateListPage";
import CertificateDetailsPage from "./pages/CertificateDetailsPage";
import StudentCertificatesPage from "./pages/StudentCertificatesPage";
import PublicVerificationPage from "./pages/PublicVerificationPage";
import AboutProjectPage from "./pages/AboutProjectPage";
import { authService } from "./services/api";

// Protected Route wrapper for Admin pages
function ProtectedAdminRoute({ children }) {
  if (!authService.isAuthenticated()) {
    return <Navigate to="/admin/login" replace />;
  }
  return children;
}

export default function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500 selection:text-white">
        <Navbar />
        <main className="flex-1">
          <Routes>
            {/* 1. Landing page */}
            <Route path="/" element={<LandingPage />} />

            {/* 2. Admin login page */}
            <Route path="/admin/login" element={<AdminLoginPage />} />

            {/* 3. Admin dashboard */}
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedAdminRoute>
                  <AdminDashboardPage />
                </ProtectedAdminRoute>
              }
            />

            {/* 4. Issue certificate page */}
            <Route
              path="/admin/issue"
              element={
                <ProtectedAdminRoute>
                  <IssueCertificatePage />
                </ProtectedAdminRoute>
              }
            />

            {/* 5. Certificate list page */}
            <Route
              path="/admin/certificates"
              element={
                <ProtectedAdminRoute>
                  <CertificateListPage />
                </ProtectedAdminRoute>
              }
            />

            {/* 6. Certificate details page */}
            <Route path="/certificates/:id" element={<CertificateDetailsPage />} />

            {/* 7. Student certificate page */}
            <Route path="/student/certificates" element={<StudentCertificatesPage />} />

            {/* 8. Public verification page & 9. Verification result page */}
            <Route path="/verify" element={<PublicVerificationPage />} />
            <Route path="/verify/:id" element={<PublicVerificationPage />} />

            {/* 10. About/project page */}
            <Route path="/about" element={<AboutProjectPage />} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}
