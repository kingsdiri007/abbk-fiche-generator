// Create this file: src/hooks/useRole.js

import { useState, useEffect } from 'react';
import { getUserRole} from '../services/supabaseService';

/**
 * Hook to get current user's role
 * @returns {{ role: 'admin'|'normal'|null, isAdmin: boolean, loading: boolean }}
 */
export function useRole() {
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRole();
  }, []);

  const loadRole = async () => {
    try {
      setLoading(true);
      const userRole = await getUserRole();
      setRole(userRole);
    } catch (error) {
      console.error('Error loading role:', error);
      setRole(null);
    } finally {
      setLoading(false);
    }
  };

  return {
    role,
    isAdmin: role === 'admin',
    isNormal: role === 'normal',
    loading,
    refresh: loadRole
  };
}

