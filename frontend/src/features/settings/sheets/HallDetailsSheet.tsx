import { useState, useEffect } from 'react';
import { BottomSheet } from '../../../components/common/BottomSheet';
import { StickyActionFooter } from '../../../components/common/StickyActionFooter';
import { FormSection, FormRow, FormInput } from '../../../components/common/FormAtoms';
import { SaveButton } from '../../../components/common/SaveButton';
import { CancelButton } from '../../../components/common/CancelButton';
import { UploadPlaceholder } from '../../../components/common/UploadPlaceholder';
import { useUnsavedChanges } from '../../../hooks/useUnsavedChanges';
import { ConfirmationDialog } from '../../../components/common/ConfirmationDialog';
import { isValidEmail, isValidPhone, isRequired } from '../../../utils/validation';
import { useSettings } from '../SettingsContext';

interface HallDetailsSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

export function HallDetailsSheet({ isOpen, onClose, onSave }: HallDetailsSheetProps) {
  const { settings, updateSettings } = useSettings();
  
  const [formData, setFormData] = useState({
    name: '',
    logo: '',
    address: '',
    mapsLink: 'https://maps.google.com/?q=manushri',
    openingHours: '08:00 AM - 10:00 PM',
    phone: '',
    emergencyContact: '+91 99999 00000',
    email: '',
    registration: 'GSTIN: 29AAAAA0000A1Z5'
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const { markDirty, markClean, handleCloseAttempt, showConfirmDialog, confirmDiscard, cancelDiscard } = useUnsavedChanges();

  // Reset states and pull from global settings when opened
  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: settings.hallDetails.name,
        logo: settings.hallDetails.logo || '',
        address: settings.hallDetails.address,
        mapsLink: 'https://maps.google.com/?q=manushri',
        openingHours: '08:00 AM - 10:00 PM',
        phone: settings.hallDetails.phone,
        emergencyContact: '+91 99999 00000',
        email: settings.hallDetails.email,
        registration: 'GSTIN: 29AAAAA0000A1Z5'
      });
      markClean();
      setErrors({});
      setIsSuccess(false);
    }
  }, [isOpen, settings.hallDetails, markClean]);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    markDirty();
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!isRequired(formData.name)) newErrors.name = 'Hall name is required';
    if (formData.email && !isValidEmail(formData.email)) newErrors.email = 'Invalid email format';
    if (formData.phone && !isValidPhone(formData.phone)) newErrors.phone = 'Invalid phone format';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    
    setIsSaving(true);
    // Persist globally
    updateSettings('hallDetails', {
      name: formData.name,
      logo: formData.logo,
      phone: formData.phone,
      email: formData.email,
      address: formData.address
    });
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSaving(false);
    setIsSuccess(true);
    markClean();
    
    setTimeout(() => {
      onSave();
    }, 1000);
  };

  return (
    <>
      <BottomSheet 
        isOpen={isOpen} 
        onClose={() => handleCloseAttempt(onClose)} 
        title="Hall Details"
        size="scroll"
        footer={
          <StickyActionFooter>
            <CancelButton onClick={() => handleCloseAttempt(onClose)} />
            <SaveButton onClick={handleSave} isSaving={isSaving} isSuccess={isSuccess} />
          </StickyActionFooter>
        }
      >
        <FormSection title="Branding">
          <UploadPlaceholder 
            label="Study Hall Logo" 
            imageUrl={formData.logo || undefined}
            onUpload={(base64) => {
              setFormData(prev => ({ ...prev, logo: base64 }));
              markDirty();
            }}
          />
        </FormSection>

        <FormSection title="Basic Information">
          <FormRow>
            <FormInput 
              label="Study Hall Name" 
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="Enter hall name"
              error={errors.name}
              required
            />
          </FormRow>
          <FormRow>
            <FormInput 
              label="Full Address" 
              value={formData.address}
              onChange={(e) => handleChange('address', e.target.value)}
              placeholder="Enter full address"
            />
            <FormInput 
              label="Google Maps Link" 
              value={formData.mapsLink}
              onChange={(e) => handleChange('mapsLink', e.target.value)}
              placeholder="https://maps.google.com/..."
            />
          </FormRow>
          <FormRow>
            <FormInput 
              label="Opening Hours" 
              value={formData.openingHours}
              onChange={(e) => handleChange('openingHours', e.target.value)}
              placeholder="e.g. 08:00 AM - 10:00 PM"
            />
          </FormRow>
        </FormSection>

        <FormSection title="Contact Details">
          <FormRow>
            <FormInput 
              label="Phone Number" 
              type="tel"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              placeholder="+91 00000 00000"
              error={errors.phone}
            />
            <FormInput 
              label="Emergency Contact" 
              type="tel"
              value={formData.emergencyContact}
              onChange={(e) => handleChange('emergencyContact', e.target.value)}
              placeholder="+91 00000 00000"
            />
          </FormRow>
          <FormRow>
            <FormInput 
              label="Email Address" 
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="hello@hall.com"
              error={errors.email}
            />
          </FormRow>
        </FormSection>

        <FormSection title="Legal & Tax">
          <FormRow>
            <FormInput 
              label="Registration / GST" 
              value={formData.registration}
              onChange={(e) => handleChange('registration', e.target.value)}
              placeholder="Enter registration number"
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
