import React from 'react';
import { useRole } from '../hooks/useRole';
import { Shield, Lock } from 'lucide-react';


export function ProtectedContent({ 
  children, 
  requiredRole = 'admin', 
  fallback = null,
  showMessage = true 
}) {
  const { role, loading } = useRole();

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
      </div>
    );
  }

  // Check if user has required role
  const hasAccess = Array.isArray(requiredRole)
    ? requiredRole.includes(role)
    : role === requiredRole;

  if (!hasAccess) {
    if (fallback) return fallback;
    
    if (showMessage) {
      return (
        <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-700 rounded-lg p-6 text-center">
          <Lock className="mx-auto mb-3 text-red-600 dark:text-red-400" size={40} />
          <h3 className="text-lg font-bold text-red-900 dark:text-red-200 mb-2">
            Access Denied
          </h3>
          <p className="text-sm text-red-700 dark:text-red-300">
            You need {Array.isArray(requiredRole) ? requiredRole.join(' or ') : requiredRole} privileges to access this content.
          </p>
        </div>
      );
    }
    
    return null;
  }

  return <>{children}</>;
}

/**
 * Component to show admin badge
 */
export function AdminBadge() {
  const { isAdmin, loading } = useRole();

  if (loading || !isAdmin) return null;

  return (
    <div className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-full text-xs font-semibold">
      <Shield size={12} />
      Admin
    </div>
  );
}

/**
 * Component to conditionally render based on role
 */
export function RoleGuard({ 
  children, 
  requiredRole = 'admin', 
  fallback = null 
}) {
  const { role, loading } = useRole();

  if (loading) return null;

  const hasAccess = Array.isArray(requiredRole)
    ? requiredRole.includes(role)
    : role === requiredRole;

  return hasAccess ? <>{children}</> : fallback;
}