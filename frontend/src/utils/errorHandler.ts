/**
 * Centralized Firestore, Auth & Storage Error Interceptor.
 * Formats low-level raw Firebase exceptions into friendly, actionable toasts.
 */
export const handleFirebaseError = (
  error: any,
  showToast: (message: string, type: 'success' | 'error' | 'info') => void,
  fallbackMessage = 'An unexpected operations failure occurred.'
): string => {
  console.error('Firebase operational error:', error);

  let userFriendlyMsg = fallbackMessage;

  if (error && error.code) {
    switch (error.code) {
      case 'permission-denied':
        userFriendlyMsg = 'Access Denied: You do not have permissions to read or write this record.';
        break;
      case 'unauthenticated':
        userFriendlyMsg = 'Session Expired: Please log in again to sync your database.';
        break;
      case 'unavailable':
        userFriendlyMsg = 'Network Offline: Connection is currently unstable. Syncing updates locally.';
        break;
      case 'storage/unauthorized':
        userFriendlyMsg = 'Access Denied: Unauthorised upload path segment or invalid auth token.';
        break;
      case 'storage/canceled':
        userFriendlyMsg = 'Upload Cancelled: Image upload aborted by operator.';
        break;
      case 'storage/retry-limit-exceeded':
        userFriendlyMsg = 'Network Interrupted: Unstable connection. Retrying upload failed.';
        break;
      case 'auth/user-not-found':
      case 'auth/wrong-password':
        userFriendlyMsg = 'Authentication Failed: Invalid admin email or password credentials.';
        break;
      case 'auth/network-request-failed':
        userFriendlyMsg = 'Connection Timeout: Authentication request timed out. Are you online?';
        break;
      default:
        if (error.message && error.message.includes('offline')) {
          userFriendlyMsg = 'Network Offline: Operating offline. Changes will sync when online.';
        } else {
          userFriendlyMsg = error.message || fallbackMessage;
        }
        break;
    }
  } else if (error && error.message) {
    if (error.message.includes('offline') || error.message.includes('onLine')) {
      userFriendlyMsg = 'Network Offline: Operating offline. Dues/markings will sync when connected.';
    } else {
      userFriendlyMsg = error.message;
    }
  }

  showToast(userFriendlyMsg, 'error');
  return userFriendlyMsg;
};

export default handleFirebaseError;
