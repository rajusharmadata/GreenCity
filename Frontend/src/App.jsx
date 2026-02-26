import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary';
import { NotificationProvider } from './context/NotificationContext';
import { AuthProvider } from './features/auth/context/authcontext';
import { ROLES, PERMISSIONS } from './features/auth/context/authcontext';
import { IssuesProvider } from './context/IssuesContext';
import Navbar from './components/Navbar';
import ProtectedRoute, { UserRoute, AdminRoute, IssueReportRoute, TransportRoute, OrganizationRoute } from './components/ProtectedRoute';
import Footer from './components/Footer';
import './App.css';

// Import pages directly
import HomePage from './pages/HomePage';
import LoginPage from './features/auth/pages/LoginPage';
import UserLoginPage from './features/auth/pages/UserLoginPage';
import UserSignupPage from './features/auth/pages/UserSignupPage';
import AdminSignupPage from './features/auth/pages/AdminSignupPage';
import OrganizationSignupPage from './features/auth/pages/OrganizationSignupPage';
import UserDashboard from './features/dashboard/pages/UserDashboard';
import MissionControl from './features/dashboard/MissionControl';
import AdminDashboard from './features/dashboard/pages/AdminDashboard';
import OrganizationDashboard from './features/dashboard/pages/OrganizationDashboard.jsx';
import ReportIssue from './features/issues/pages/ReportIssue';
import ReportFlow from './features/issues/ReportFlow';
import ImpactScreen from './features/impact/ImpactScreen';
import TransportEntry from './features/transport/pages/TransportEntry';
import NotFoundPage from './pages/NotFoundPage';
import UnauthorizedPage from './pages/UnauthorizedPage';
import OAuthCallback from './features/auth/pages/OAuthCallback.jsx';
import AboutPage from "./pages/AboutPage.jsx"
import ContactPage from "./pages/ContactPage.jsx"
import EcoTransport from './features/transport/pages/EcoTransport.jsx';
import HowItWorks from './pages/HowItWorks.jsx'
import VerifyEmailPage from './features/auth/pages/VerifyEmailPage.jsx';
// Layout components
function App() {
  return (
    <ErrorBoundary>
      <Router>
        <NotificationProvider>
          <AuthProvider>
            <IssuesProvider>
              <div className="flex min-h-screen flex-col bg-[#030d0a]">
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
                      path="/mission-control"
                      element={
                        <UserRoute>
                          <MissionControl />
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
                      path="/report-flow"
                      element={
                        <IssueReportRoute>
                          <ReportFlow />
                        </IssueReportRoute>
                      }
                    />

                    <Route
                      path="/gamification"
                      element={
                        <UserRoute>
                          <ImpactScreen />
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
            </IssuesProvider>
          </AuthProvider>
        </NotificationProvider>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
