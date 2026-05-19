import { useState, useEffect } from 'react';
import { MessageSquareText } from 'lucide-react';
import { BottomSheet } from '../../../components/common/BottomSheet';
import { StickyActionFooter } from '../../../components/common/StickyActionFooter';
import { FormSection, FormRow, FormInput, FormToggle, FormTextarea } from '../../../components/common/FormAtoms';
import { SaveButton } from '../../../components/common/SaveButton';
import { CancelButton } from '../../../components/common/CancelButton';
import { useUnsavedChanges } from '../../../hooks/useUnsavedChanges';
import { ConfirmationDialog } from '../../../components/common/ConfirmationDialog';
import { useSettings } from '../SettingsContext';

interface ReminderSettingsSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

export function ReminderSettingsSheet({ isOpen, onClose, onSave }: ReminderSettingsSheetProps) {
  const { settings, updateSettings } = useSettings();

  const [formData, setFormData] = useState({
    whatsappEnabled: true,
    daysBefore: '3',
    sendTime: '08:00',
    frequency: 'Daily',
    template: ''
  });

  const [isSaving, setIsSaving] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const { markDirty, markClean, handleCloseAttempt, showConfirmDialog, confirmDiscard, cancelDiscard } = useUnsavedChanges();

  useEffect(() => {
    if (isOpen) {
      setFormData({
        whatsappEnabled: true,
        daysBefore: settings.paymentSettings.gracePeriodDays.toString(),
        sendTime: '08:00',
        frequency: 'Daily',
        template: settings.paymentSettings.reminderTemplate
      });
      markClean();
      setIsSuccess(false);
    }
  }, [isOpen, settings.paymentSettings, markClean]);

  const handleChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    markDirty();
  };

  const handleSave = async () => {
    setIsSaving(true);
    // Persist globally
    updateSettings('paymentSettings', {
      reminderTemplate: formData.template,
      gracePeriodDays: parseInt(formData.daysBefore, 10) || 3
    });
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSaving(false);
    setIsSuccess(true);
    markClean();
    setTimeout(() => onSave(), 1000);
  };

  const handlePreview = () => {
    // Basic preview logic
    alert(formData.template
      .replace('{name}', 'Rahul')
      .replace('{seat}', 'A-12')
      .replace('{date}', '15th May')
      .replace('{amount}', '1500')
    );
  };

  return (
    <>
      <BottomSheet 
        isOpen={isOpen} 
        onClose={() => handleCloseAttempt(onClose)} 
        title="Reminder Settings"
        size="scroll"
        footer={
          <StickyActionFooter>
            <CancelButton onClick={() => handleCloseAttempt(onClose)} />
            <SaveButton onClick={handleSave} isSaving={isSaving} isSuccess={isSuccess} />
          </StickyActionFooter>
        }
      >
        <FormSection title="Communication Channel">
          <FormToggle 
            label="Enable WhatsApp Reminders" 
            checked={formData.whatsappEnabled}
            onChange={(checked) => handleChange('whatsappEnabled', checked)}
            helper="Send automated messages using the WhatsApp API."
          />
        </FormSection>

        <FormSection title="Schedule">
          <FormRow>
            <div className="grid grid-cols-2 gap-4">
              <FormInput 
                label="Days Before Due" 
                type="number"
                value={formData.daysBefore}
                onChange={(e) => handleChange('daysBefore', e.target.value)}
                helper="e.g. 3 days before"
              />
              <FormInput 
                label="Sending Time" 
                type="time"
                value={formData.sendTime}
                onChange={(e) => handleChange('sendTime', e.target.value)}
                helper="e.g. 08:00 AM"
              />
            </div>
          </FormRow>
        </FormSection>

        <FormSection title="Message Template">
          <FormRow>
            <FormTextarea 
              label="WhatsApp Template" 
              value={formData.template}
              onChange={(e) => handleChange('template', e.target.value)}
              helper="Use placeholders like {name}, {seat}, {date}, {amount}."
            />
            <button 
              onClick={handlePreview}
              className="mt-2 flex items-center justify-center gap-2 py-3 px-4 bg-indigo-50 text-indigo-600 rounded-2xl font-bold text-xs uppercase tracking-wider active:scale-[0.98] transition-all"
            >
              <MessageSquareText size={16} />
              Preview Message
            </button>
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
