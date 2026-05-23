import { useState, useCallback } from "react";

export function useUnsavedChanges(initialIsDirty = false) {
  const [isDirty, setIsDirty] = useState(initialIsDirty);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingCloseAction, setPendingCloseAction] = useState<
    (() => void) | null
  >(null);

  const markDirty = useCallback(() => setIsDirty(true), []);
  const markClean = useCallback(() => setIsDirty(false), []);

  const handleCloseAttempt = useCallback(
    (onClose: () => void) => {
      if (isDirty) {
        setPendingCloseAction(() => onClose);
        setShowConfirmDialog(true);
      } else {
        onClose();
      }
    },
    [isDirty],
  );

  const confirmDiscard = useCallback(() => {
    setShowConfirmDialog(false);
    setIsDirty(false); // Clean it up so it can close
    if (pendingCloseAction) {
      pendingCloseAction();
      setPendingCloseAction(null);
    }
  }, [pendingCloseAction]);

  const cancelDiscard = useCallback(() => {
    setShowConfirmDialog(false);
    setPendingCloseAction(null);
  }, []);

  return {
    isDirty,
    markDirty,
    markClean,
    handleCloseAttempt,
    showConfirmDialog,
    confirmDiscard,
    cancelDiscard,
  };
}
