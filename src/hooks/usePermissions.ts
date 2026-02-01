/**
 * Hook for managing location permissions
 */

import { useState, useEffect, useCallback } from 'react';
import {
  getForegroundPermissionStatus,
  getBackgroundPermissionStatus,
  requestForegroundPermissions,
  requestBackgroundPermissions,
} from '../services/locationService';

export interface PermissionsState {
  foreground: boolean | null;
  background: boolean | null;
  loading: boolean;
}

export interface UsePermissionsResult {
  permissions: PermissionsState;
  requestForeground: () => Promise<void>;
  requestBackground: () => Promise<void>;
  checkPermissions: () => Promise<void>;
  hasAllPermissions: boolean;
  missingPermissions: Array<'foreground' | 'background'>;
}

/**
 * Manage location permissions state and requests
 */
export function usePermissions(): UsePermissionsResult {
  const [permissions, setPermissions] = useState<PermissionsState>({
    foreground: null,
    background: null,
    loading: true,
  });

  const checkPermissions = useCallback(async () => {
    try {
      const fg = await getForegroundPermissionStatus();
      const bg = await getBackgroundPermissionStatus();
      setPermissions({ foreground: fg, background: bg, loading: false });
    } catch (e) {
      setPermissions({ foreground: false, background: false, loading: false });
    }
  }, []);

  const requestForeground = useCallback(async () => {
    await requestForegroundPermissions();
    setTimeout(checkPermissions, 400);
  }, [checkPermissions]);

  const requestBackground = useCallback(async () => {
    await requestBackgroundPermissions();
    setTimeout(checkPermissions, 400);
  }, [checkPermissions]);

  useEffect(() => {
    checkPermissions();
  }, [checkPermissions]);

  const hasAllPermissions = permissions.foreground === true && permissions.background === true;
  
  const missingPermissions: Array<'foreground' | 'background'> = [];
  if (permissions.foreground !== true) missingPermissions.push('foreground');
  if (permissions.background !== true) missingPermissions.push('background');

  return {
    permissions,
    requestForeground,
    requestBackground,
    checkPermissions,
    hasAllPermissions,
    missingPermissions,
  };
}
