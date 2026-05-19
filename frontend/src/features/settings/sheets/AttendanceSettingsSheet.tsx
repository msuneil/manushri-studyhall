import { useState, useEffect } from 'react';
import { BottomSheet } from '../../../components/common/BottomSheet';
import { StickyActionFooter } from '../../../components/common/StickyActionFooter';
import { FormSection, FormRow, FormInput, FormToggle } from '../../../components/common/FormAtoms';
import { SaveButton } from '../../../components/common/SaveButton';
import { CancelButton } from '../../../components/common/CancelButton';
import { useUnsavedChanges } from '../../../hooks/useUnsavedChanges';
import { ConfirmationDialog } from '../../../components/common/ConfirmationDialog';
import { useSettings } from '../SettingsContext';

interface AttendanceSettingsSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

export function AttendanceSettingsSheet({ isOpen, onClose, onSave }: AttendanceSettingsSheetProps) {
  const { settings, updateSettings } = useSettings();

  const [formData, setFormData] = useState({
    openingTime: '06:00',
    closingTime: '22:00',
    autoMarkAbsent: false,
    markingWindow: '30',
    cutoffWarningEnabled: true,
    manualOverrideEnabled: true
  });

  const [isSaving, setIsSaving] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const { markDirty, markClean, handleCloseAttempt, showConfirmDialog, confirmDiscard, cancelDiscard } = useUnsavedChanges();

  useEffect(() => {
    if (isOpen) {
      setFormData({
        openingTime: settings.attendanceSettings.openingTime,
        closingTime: settings.attendanceSettings.closingTime,
        autoMarkAbsent: settings.attendanceSettings.autoMarkAbsent,
        markingWindow: settings.attendanceSettings.attendanceGracePeriodMinutes.toString(),
        cutoffWarningEnabled: true,
        manualOverrideEnabled: true
      });
      markClean();
      setIsSuccess(false);
    }
  }, [isOpen, settings.attendanceSettings, markClean]);

  const handleChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    markDirty();
  };

  const handleSave = async () => {
    setIsSaving(true);
    // Persist globally
    updateSettings('attendanceSettings', {
      openingTime: formData.openingTime,
      closingTime: formData.closingTime,
      autoMarkAbsent: formData.autoMarkAbsent,
      attendanceGracePeriodMinutes: parseInt(formData.markingWindow, 10) || 30
    });
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSaving(false);
    setIsSuccess(true);
    markClean();
    setTimeout(() => onSave(), 1000);
  };

  return (
    <>
      <BottomSheet 
        isOpen={isOpen} 
        onClose={() => handleCloseAttempt(onClose)} 
        title="Attendance Settings"
        size="scroll"
        footer={
          <StickyActionFooter>
            <CancelButton onClick={() => handleCloseAttempt(onClose)} />
            <SaveButton onClick={handleSave} isSaving={isSaving} isSuccess={isSuccess} />
          </StickyActionFooter>
        }
      >
        <FormSection title="Marking Window">
          <FormRow>
            <div className="grid grid-cols-2 gap-4">
              <FormInput 
                label="Opening Time" 
                type="time"
                value={formData.openingTime}
                onChange={(e) => handleChange('openingTime', e.target.value)}
              />
              <FormInput 
                label="Closing Time" 
                type="time"
                value={formData.closingTime}
                onChange={(e) => handleChange('closingTime', e.target.value)}
              />
            </div>
          </FormRow>
          <FormRow>
            <FormInput 
              label="Grace Period (Mins)" 
              type="number"
              value={formData.markingWindow}
              onChange={(e) => handleChange('markingWindow', e.target.value)}
              helper="Number of minutes after opening time for marking presence."
            />
          </FormRow>
        </FormSection>

        <FormSection title="Automation">
          <FormToggle 
            label="Auto-mark Absent" 
            checked={formData.autoMarkAbsent}
            onChange={(checked) => handleChange('autoMarkAbsent', checked)}
            helper="Automatically mark occupants as absent if not marked present within the window."
          />
          <FormToggle 
            label="Cutoff Warning Alert" 
            checked={formData.cutoffWarningEnabled}
            onChange={(checked) => handleChange('cutoffWarningEnabled', checked)}
            helper="Notify admins 15 mins before the grace period ends."
          />
        </FormSection>

        <FormSection title="Operational Rules">
          <FormToggle 
            label="Allow Manual Override" 
            checked={formData.manualOverrideEnabled}
            onChange={(checked) => handleChange('manualOverrideEnabled', checked)}
            helper="Enable admins to manually correct attendance records after the cutoff."
          />
        </FormSection>
      </BottomSheet>

      <ConfirmationDialog 
        isOpen={showConfirmDialog}
        title="Discard Changes?"
        description="You have unsaved changes. Are you sure you want to discard them?"
        confirmLabel="Discard"
        cancelLabel="Continue Editing"
        onConfirm={confirmDiscard}
        onCancel={cancelDiscard}
      />
    </>
  );
}
