import { collection, query, where, getDocs, doc, writeBatch } from 'firebase/firestore';
import { db } from '../lib/firebase/firestore';

/**
 * Destructive Firestore hard-reset utility.
 * Scoped STRICTLY to local development environments.
 * Completely deletes all documents in target operational collections for the given hallId,
 * and deletes the settings document to trigger a fresh onboarding experience on reload.
 */
export const devResetFirestore = async (hallId: string): Promise<void> => {
  // STRICT environment safety check
  const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  const isDevMode = import.meta.env.DEV;

  if (!isLocalhost && !isDevMode) {
    throw new Error('[SECURITY ALERT] __devResetFirestore is restricted strictly to local development modes!');
  }

  if (!hallId) {
    console.error('[devResetFirestore] A valid hallId (operator UID) must be provided.');
    alert('Please provide your active hallId (UID) to reset.');
    return;
  }

  const confirmReset = confirm(
    `[DEVELOPER WARNING]\n\n` +
    `Are you absolutely sure you want to completely reset and hard-delete all Firestore collections for Hall ID: ${hallId}?\n\n` +
    `This will delete:\n` +
    `- rooms\n- seats\n- occupants\n- payments\n- expenses\n- tasks\n- notifications\n- attendanceSessions\n- settings document\n\n` +
    `Click OK to proceed with the clean reset.`
  );

  if (!confirmReset) {
    console.log('[devResetFirestore] Reset canceled.');
    return;
  }

  try {
    console.log(`[devResetFirestore] Beginning complete clean reset pass for hall: ${hallId}`);
    
    // Target collections to query and hard-delete
    const collectionsToClear = [
      'rooms',
      'seats',
      'occupants',
      'payments',
      'expenses',
      'tasks',
      'notifications',
      'attendanceSessions'
    ];

    let batch = writeBatch(db);
    let operationCount = 0;

    const commitBatchIfNeeded = async (force = false) => {
      if (operationCount >= 400 || (force && operationCount > 0)) {
        await batch.commit();
        batch = writeBatch(db);
        operationCount = 0;
      }
    };

    // 1. Queue deletion of scoped operational documents
    for (const colName of collectionsToClear) {
      const colRef = collection(db, colName);
      const colQuery = query(colRef, where('hallId', '==', hallId));
      const querySnap = await getDocs(colQuery);

      console.log(`[devResetFirestore] Queuing deletion of ${querySnap.size} documents in collection: ${colName}`);
      
      for (const docSnap of querySnap.docs) {
        batch.delete(docSnap.ref);
        operationCount++;
        await commitBatchIfNeeded();
      }
    }

    // 2. Queue absolute hard-deletion of the settings document (MX1 requirement)
    const settingsRef = doc(db, 'settings', hallId);
    console.log(`[devResetFirestore] Queuing deletion of settings document: ${settingsRef.path}`);
    batch.delete(settingsRef);
    operationCount++;
    
    // Commit any remaining operations
    await commitBatchIfNeeded(true);

    console.log('[devResetFirestore] Reset complete! Reloading page to initiate clean re-onboarding...');
    alert('Firestore successfully reset! The page will now reload to start onboarding.');
    window.location.reload();
  } catch (error) {
    console.error('[devResetFirestore] Hard reset operation failed:', error);
    alert(`Reset failed: ${error}`);
  }
};
