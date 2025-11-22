import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary';
import { NotificationProvider } from './context/NotificationContext';
import { AuthProvider } from './context/authcontext';
import { ROLES, PERMISSIONS } from './context/authcontext';
import Navbar from './components/Navbar';
import ProtectedRoute, { UserRoute, AdminRoute, IssueReportRoute, TransportRoute, OrganizationRoute } from './components/ProtectedRoute';
import Footer from './components/Footer';
import './App.css';

// Import pages directly
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import UserLoginPage from './pages/UserLoginPage';
import UserSignupPage from './pages/UserSignupPage';
import AdminSignupPage from './pages/AdminSignupPage';
import OrganizationSignupPage from './pages/OrganizationSignupPage';
import UserDashboard from './pages/UserDashboard';
import AdminDashboard from './pages/AdminDashboard';
import OrganizationDashboard from './pages/OrganizationDashboard.jsx';
import ReportIssue from './pages/ReportIssue';
import Gamification from './pages/Gamification';
import TransportEntry from './pages/TransportEntry';
import NotFoundPage from './pages/NotFoundPage';
import UnauthorizedPage from './pages/UnauthorizedPage';
import OAuthCallback from './pages/OAuthCallback.jsx';
import AboutPage from "./pages/AboutPage.jsx"
import ContactPage from "./pages/ContactPage.jsx"
import EcoTransport from './pages/EcoTransport.jsx';
import HowItWorks from './pages/HowItWorks.jsx'
import VerifyEmailPage from './pages/VerifyEmailPage.jsx';
// Layout components
function App() {
  return (
    <ErrorBoundary>
      <Router>
        <NotificationProvider>
        <AuthProvider>
            <div className="flex min-h-screen flex-col bg-slate-50">
              <Navbar />
              <main className="flex-grow pt-24">
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/about" element={<AboutPage />} />
                  <Route path="/contact" element={<ContactPage />} />
                  <Route path="/eco-transport" element={<EcoTransport />} />
                  <Route path="/how-it-works" element={<HowItWorks />} />

                  {/* Auth Routes */}
                  <Route path="/login/user" element={<UserLoginPage />} />
                  <Route path="/login/org" element={<LoginPage />} />
                  <Route path="/login/admin" element={<LoginPage isAdmin={true} />} />
                  <Route path="/register/user" element={<UserSignupPage />} />
                  <Route path="/register/org" element={<OrganizationSignupPage />} />
                  <Route path="/register/admin" element={<AdminSignupPage />} />
                  {/* Legacy redirects */}
                  <Route path="/login" element={<Navigate to="/login/org" replace />} />
                  <Route path="/user-login" element={<Navigate to="/login/user" replace />} />
                  <Route path="/admin-login" element={<Navigate to="/login/admin" replace />} />
                  <Route path="/user-signup" element={<Navigate to="/register/user" replace />} />
                  <Route path="/organization-signup" element={<Navigate to="/register/org" replace />} />
                  <Route path="/admin-signup" element={<Navigate to="/register/admin" replace />} />
                  <Route path="/verify-email" element={<VerifyEmailPage />} />

                  {/* Protected User Routes */}
                  <Route
                    path="/user-dashboard"
                    element={
                      <UserRoute>
                        <UserDashboard />
                      </UserRoute>
                    }
                  />

                  <Route
                    path="/report-issue"
                    element={
                      <IssueReportRoute>
                        <ReportIssue />
                      </IssueReportRoute>
                    }
                  />

                  <Route
                    path="/gamification"
                    element={
                      <UserRoute>
                        <Gamification />
                      </UserRoute>
                    }
                  />

                  {/* Protected Admin Routes */}
                  <Route
                    path="/admin-dashboard"
                    element={
                      <AdminRoute>
                        <AdminDashboard />
                      </AdminRoute>
                    }
                  />
                      <Route
                        path="/organization-dashboard"
                        element={
                          <OrganizationRoute>
                            <OrganizationDashboard />
                          </OrganizationRoute>
                    }
                  />
                  <Route
                    path="/transport-entry"
                    element={
                      <TransportRoute>
                        <TransportEntry />
                      </TransportRoute>
                    }
                  />

                  {/* Unauthorized Page */}
                  <Route path="/unauthorized" element={<UnauthorizedPage />} />

                  {/* OAuth Callback */}
                  <Route path="/auth/callback" element={<OAuthCallback />} />

                  {/* 404 Route */}
                  <Route path="*" element={<NotFoundPage />} />
                </Routes>
              </main>
              <Footer />
            </div>
          </AuthProvider>
          </NotificationProvider>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
