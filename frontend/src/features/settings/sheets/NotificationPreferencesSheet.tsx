import { BellRing } from 'lucide-react';
import { BottomSheet } from '../../../components/common/BottomSheet';
import { EmptyState } from '../../../components/common/EmptyState';
import { FormSection, FormToggle } from '../../../components/common/FormAtoms';

interface NotificationPreferencesSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationPreferencesSheet({ isOpen, onClose }: NotificationPreferencesSheetProps) {
  return (
    <BottomSheet 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Notification Preferences"
      size="scroll"
    >
      <div className="mb-6">
        <EmptyState 
          icon={BellRing}
          title="Smart Alerts (Coming Soon)"
          description="We are building a comprehensive notification center to keep you updated on operational events in real-time."
        />
      </div>

      <div className="opacity-50 pointer-events-none">
        <FormSection title="Financial Alerts">
          <FormToggle 
            label="Overdue Payments" 
            checked={true}
            onChange={() => {}}
            helper="Get notified when occupants cross the fee grace period."
          />
          <FormToggle 
            label="Expense Thresholds" 
            checked={false}
            onChange={() => {}}
            helper="Alert when monthly expenses exceed set budgets."
          />
        </FormSection>

        <FormSection title="Operational Alerts">
          <FormToggle 
            label="Low Attendance" 
            checked={true}
            onChange={() => {}}
            helper="Daily summary of occupants who missed attendance."
          />
          <FormToggle 
            label="New Admissions" 
            checked={true}
            onChange={() => {}}
            helper="Instant alert when a new occupant is onboarded."
          />
        </FormSection>
      </div>
    </BottomSheet>
  );
}
