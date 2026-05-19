import { useState, useEffect } from 'react';
import { BottomSheet } from '../../../components/common/BottomSheet';
import { StickyActionFooter } from '../../../components/common/StickyActionFooter';
import { FormSection, FormRow, FormInput, FormTextarea, FormToggle } from '../../../components/common/FormAtoms';
import { SaveButton } from '../../../components/common/SaveButton';
import { CancelButton } from '../../../components/common/CancelButton';
import { useUnsavedChanges } from '../../../hooks/useUnsavedChanges';
import { ConfirmationDialog } from '../../../components/common/ConfirmationDialog';
import { useSettings } from '../SettingsContext';

interface RoomDefaultsSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

export function RoomDefaultsSheet({ isOpen, onClose, onSave }: RoomDefaultsSheetProps) {
  const { settings, updateSettings } = useSettings();

  const [formData, setFormData] = useState({
    defaultSeatCount: '40',
    acEnabled: true,
    defaultAmenities: 'WiFi, Power Backup, RO Water',
    commonRules: '1. No noise in the hall.\n2. Maintain cleanliness.\n3. Mobile on silent mode.',
    autoOccupancy: true
  });

  const [isSaving, setIsSaving] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const { markDirty, markClean, handleCloseAttempt, showConfirmDialog, confirmDiscard, cancelDiscard } = useUnsavedChanges();

  useEffect(() => {
    if (isOpen) {
      setFormData({
        defaultSeatCount: settings.roomDefaults.defaultSeatCount.toString(),
        acEnabled: settings.roomDefaults.acEnabled,
        defaultAmenities: settings.roomDefaults.defaultAmenities,
        commonRules: settings.roomDefaults.commonRules,
        autoOccupancy: settings.roomDefaults.autoOccupancy
      });
      markClean();
      setIsSuccess(false);
    }
  }, [isOpen, settings.roomDefaults, markClean]);

  const handleChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    markDirty();
  };

  const handleSave = async () => {
    setIsSaving(true);
    // Persist globally
    updateSettings('roomDefaults', {
      defaultSeatCount: parseInt(formData.defaultSeatCount, 10) || 40,
      acEnabled: formData.acEnabled,
      defaultAmenities: formData.defaultAmenities,
      commonRules: formData.commonRules,
      autoOccupancy: formData.autoOccupancy
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
        title="Room Defaults"
        size="scroll"
        footer={
          <StickyActionFooter>
            <CancelButton onClick={() => handleCloseAttempt(onClose)} />
            <SaveButton onClick={handleSave} isSaving={isSaving} isSuccess={isSuccess} />
          </StickyActionFooter>
        }
      >
        <FormSection title="Configuration">
          <FormRow>
            <FormInput 
              label="Default Seat Count" 
              type="number"
              value={formData.defaultSeatCount}
              onChange={(e) => handleChange('defaultSeatCount', e.target.value)}
              helper="Initial seat count when creating a new room."
            />
          </FormRow>
          <FormRow>
            <FormInput 
              label="Default Amenities" 
              value={formData.defaultAmenities}
              onChange={(e) => handleChange('defaultAmenities', e.target.value)}
              helper="Comma-separated list of included amenities."
            />
          </FormRow>
          <FormToggle 
            label="AC Enabled by Default" 
            checked={formData.acEnabled}
            onChange={(checked) => handleChange('acEnabled', checked)}
          />
        </FormSection>

        <FormSection title="Operations">
          <FormToggle 
            label="Auto-calculate Occupancy" 
            checked={formData.autoOccupancy}
            onChange={(checked) => handleChange('autoOccupancy', checked)}
            helper="Automatically update room occupancy percentage based on active seats."
          />
        </FormSection>

        <FormSection title="Standard Rules">
          <FormRow>
            <FormTextarea 
              label="Common Hall Rules" 
              value={formData.commonRules}
              onChange={(e) => handleChange('commonRules', e.target.value)}
              placeholder="Enter rules separated by lines..."
              helper="These rules will be visible to occupants in their dashboard."
            />
          </FormRow>
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
