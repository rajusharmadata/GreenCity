import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth, ROLES, PERMISSIONS } from '../context/authcontext';

// Enhanced ProtectedRoute with role-based access control
const ProtectedRoute = ({ children, requiredRole, requiredPermission, redirectTo = '/' }) => {
  const { isAuthenticated, loading, hasRole, hasPermission, currentUser } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-green-200 border-t-green-600 rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-2 h-2 bg-green-600 rounded-full animate-ping"></div>
          </div>
        </div>
        <p className="ml-4 text-gray-600 font-medium">Verifying authentication...</p>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return (
      <Navigate 
        to={redirectTo} 
        state={{ from: location.pathname }} 
        replace 
      />
    );
  }

  // Check role-based access
  if (requiredRole && !hasRole(requiredRole)) {
    return (
      <Navigate 
        to="/unauthorized" 
        state={{ 
          message: `Access denied. Required role: ${requiredRole}`,
          from: location.pathname 
        }} 
        replace 
      />
    );
  }

  // Check permission-based access
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return (
      <Navigate 
        to="/unauthorized" 
        state={{ 
          message: `Access denied. Required permission: ${requiredPermission}`,
          from: location.pathname 
        }} 
        replace 
      />
    );
  }

  // User is authenticated and authorized
  return children;
};

// Specialized route components for better readability
export const UserRoute = ({ children, ...props }) => (
  <ProtectedRoute requiredRole={ROLES.USER} {...props}>
    {children}
  </ProtectedRoute>
);

export const AdminRoute = ({ children, ...props }) => (
  <ProtectedRoute requiredRole={ROLES.ADMIN} {...props}>
    {children}
  </ProtectedRoute>
);

export const OrganizationRoute = ({ children, ...props }) => (
  <ProtectedRoute requiredRole={ROLES.ORGANIZATION} {...props}>
    {children}
  </ProtectedRoute>
);

// Permission-based route components
export const DashboardRoute = ({ children, ...props }) => (
  <ProtectedRoute requiredPermission={PERMISSIONS.VIEW_DASHBOARD} {...props}>
    {children}
  </ProtectedRoute>
);

export const TransportRoute = ({ children, ...props }) => (
  <ProtectedRoute requiredPermission={PERMISSIONS.MANAGE_TRANSPORT} {...props}>
    {children}
  </ProtectedRoute>
);

export const IssueReportRoute = ({ children, ...props }) => (
  <ProtectedRoute requiredPermission={PERMISSIONS.REPORT_ISSUE} {...props}>
    {children}
  </ProtectedRoute>
);

export default ProtectedRoute;