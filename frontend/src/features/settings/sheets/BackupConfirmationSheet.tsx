import { useState } from 'react';
import { Database } from 'lucide-react';
import { BottomSheet } from '../../../components/common/BottomSheet';
import { StickyActionFooter } from '../../../components/common/StickyActionFooter';
import { SaveButton } from '../../../components/common/SaveButton';
import { CancelButton } from '../../../components/common/CancelButton';
import { EmptyState } from '../../../components/common/EmptyState';

interface BackupConfirmationSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onBackup: () => void;
}

export function BackupConfirmationSheet({ isOpen, onClose, onBackup }: BackupConfirmationSheetProps) {
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleBackupAction = async () => {
    setIsBackingUp(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsBackingUp(false);
    setIsSuccess(true);
    setTimeout(() => {
      onBackup();
      setIsSuccess(false);
    }, 1000);
  };

  return (
    <BottomSheet 
      isOpen={isOpen} 
      onClose={onClose} 
      title="System Backup"
      size="scroll"
      footer={
        <StickyActionFooter>
          <CancelButton onClick={onClose} />
          <SaveButton 
            onClick={handleBackupAction} 
            label="Start Backup" 
            isSaving={isBackingUp} 
            isSuccess={isSuccess} 
          />
        </StickyActionFooter>
      }
    >
      <div className="mt-2">
        <EmptyState 
          icon={Database}
          title="Secure Cloud Backup"
          description="This will create a secure snapshot of all your operational data including occupants, payments, and settings in the cloud."
        />
        <p className="text-center text-[10px] font-medium text-slate-400 mt-6">
          Last backup: Today at 02:00 AM
        </p>
      </div>
    </BottomSheet>
  );
}
