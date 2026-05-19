import { useState, useEffect } from 'react';
import { BottomSheet } from '../../../components/common/BottomSheet';
import { StickyActionFooter } from '../../../components/common/StickyActionFooter';
import { FormSection, FormRow, FormInput } from '../../../components/common/FormAtoms';
import { SaveButton } from '../../../components/common/SaveButton';
import { CancelButton } from '../../../components/common/CancelButton';
import { useUnsavedChanges } from '../../../hooks/useUnsavedChanges';
import { ConfirmationDialog } from '../../../components/common/ConfirmationDialog';
import { isValidEmail, isValidPhone, isRequired } from '../../../utils/validation';
import { useSettings } from '../SettingsContext';

interface OwnerProfileSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

export function OwnerProfileSheet({ isOpen, onClose, onSave }: OwnerProfileSheetProps) {
  const { settings, updateSettings } = useSettings();

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    whatsappNumber: '',
    alternatePhone: '',
    email: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const { markDirty, markClean, handleCloseAttempt, showConfirmDialog, confirmDiscard, cancelDiscard } = useUnsavedChanges();

  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: settings.ownerDetails.name,
        phone: settings.ownerDetails.phone,
        whatsappNumber: settings.ownerDetails.phone, // Default WhatsApp to primary phone if not separated
        alternatePhone: '',
        email: settings.ownerDetails.email
      });
      markClean();
      setErrors({});
      setIsSuccess(false);
    }
  }, [isOpen, settings.ownerDetails, markClean]);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    markDirty();
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!isRequired(formData.name)) newErrors.name = 'Name is required';
    if (formData.email && !isValidEmail(formData.email)) newErrors.email = 'Invalid email format';
    if (formData.phone && !isValidPhone(formData.phone)) newErrors.phone = 'Invalid phone format';
    if (formData.whatsappNumber && !isValidPhone(formData.whatsappNumber)) newErrors.whatsappNumber = 'Invalid phone format';
    if (formData.alternatePhone && !isValidPhone(formData.alternatePhone)) newErrors.alternatePhone = 'Invalid phone format';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setIsSaving(true);
    // Persist globally
    updateSettings('ownerDetails', {
      name: formData.name,
      phone: formData.phone,
      email: formData.email
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
        title="Owner Profile"
        size="scroll"
        footer={
          <StickyActionFooter>
            <CancelButton onClick={() => handleCloseAttempt(onClose)} />
            <SaveButton onClick={handleSave} isSaving={isSaving} isSuccess={isSuccess} />
          </StickyActionFooter>
        }
      >
        <FormSection title="Personal Information">
          <FormRow>
            <FormInput 
              label="Full Name" 
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="Enter your name"
              error={errors.name}
              required
            />
          </FormRow>
          <FormRow>
            <FormInput 
              label="Email Address" 
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="owner@hall.com"
              error={errors.email}
            />
          </FormRow>
        </FormSection>

        <FormSection title="Contact Numbers">
          <FormRow>
            <FormInput 
              label="Primary Phone" 
              type="tel"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              placeholder="+91 00000 00000"
              error={errors.phone}
            />
          </FormRow>
          <FormRow>
            <div className="grid grid-cols-2 gap-4">
              <FormInput 
                label="WhatsApp Number" 
                type="tel"
                value={formData.whatsappNumber}
                onChange={(e) => handleChange('whatsappNumber', e.target.value)}
                placeholder="+91 00000 00000"
                error={errors.whatsappNumber}
              />
              <FormInput 
                label="Alternate Phone" 
                type="tel"
                value={formData.alternatePhone}
                onChange={(e) => handleChange('alternatePhone', e.target.value)}
                placeholder="+91 00000 00000"
                error={errors.alternatePhone}
              />
            </div>
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
