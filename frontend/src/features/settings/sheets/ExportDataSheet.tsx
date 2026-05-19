import { useState } from 'react';
import { Download } from 'lucide-react';
import { BottomSheet } from '../../../components/common/BottomSheet';
import { StickyActionFooter } from '../../../components/common/StickyActionFooter';
import { FormSection, FormToggle } from '../../../components/common/FormAtoms';
import { SaveButton } from '../../../components/common/SaveButton';
import { CancelButton } from '../../../components/common/CancelButton';
import { EmptyState } from '../../../components/common/EmptyState';

interface ExportDataSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: () => void;
}

export function ExportDataSheet({ isOpen, onClose, onExport }: ExportDataSheetProps) {
  const [exports, setExports] = useState({
    occupants: true,
    payments: true,
    attendance: false,
    expenses: false
  });

  const [isExporting, setIsExporting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleToggle = (field: keyof typeof exports) => {
    setExports(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const handleExportAction = async () => {
    setIsExporting(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsExporting(false);
    setIsSuccess(true);
    setTimeout(() => {
      onExport();
      setIsSuccess(false);
    }, 1000);
  };

  const hasSelection = Object.values(exports).some(Boolean);

  return (
    <BottomSheet 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Export Data"
      size="scroll"
      footer={
        <StickyActionFooter>
          <CancelButton onClick={onClose} />
          <SaveButton 
            onClick={hasSelection ? handleExportAction : () => {}} 
            label="Export Now" 
            isSaving={isExporting} 
            isSuccess={isSuccess} 
          />
        </StickyActionFooter>
      }
    >
      <div className="mb-6">
        <EmptyState 
          icon={Download}
          title="Data Export"
          description="Select the records you want to export as CSV files. A download link will be generated."
        />
      </div>

      <FormSection title="Select Data to Export">
        <FormToggle 
          label="Occupants & Profiles" 
          checked={exports.occupants}
          onChange={() => handleToggle('occupants')}
        />
        <FormToggle 
          label="Payment History" 
          checked={exports.payments}
          onChange={() => handleToggle('payments')}
        />
        <FormToggle 
          label="Attendance Records" 
          checked={exports.attendance}
          onChange={() => handleToggle('attendance')}
        />
        <FormToggle 
          label="Expense Logs" 
          checked={exports.expenses}
          onChange={() => handleToggle('expenses')}
        />
      </FormSection>
    </BottomSheet>
  );
}
