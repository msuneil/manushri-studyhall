import { useState, useEffect } from 'react';
import { BottomSheet } from '../../../components/common/BottomSheet';
import { StickyActionFooter } from '../../../components/common/StickyActionFooter';
import { FormSection, FormRow, FormInput } from '../../../components/common/FormAtoms';
import { SaveButton } from '../../../components/common/SaveButton';
import { CancelButton } from '../../../components/common/CancelButton';
import { History, Laptop } from 'lucide-react';
import { useUnsavedChanges } from '../../../hooks/useUnsavedChanges';
import { ConfirmationDialog } from '../../../components/common/ConfirmationDialog';

interface AdminAccessSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

export function AdminAccessSheet({ isOpen, onClose, onSave }: AdminAccessSheetProps) {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const { markDirty, markClean, handleCloseAttempt, showConfirmDialog, confirmDiscard, cancelDiscard } = useUnsavedChanges();

  useEffect(() => {
    if (isOpen) {
      markClean();
      setErrors({});
      setIsSuccess(false);
      setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    }
  }, [isOpen, markClean]);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
    markDirty();
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }
    if (!formData.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters';
    }
    if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setIsSaving(true);
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
        title="Admin Access"
        size="scroll"
        footer={
          <StickyActionFooter>
            <CancelButton onClick={() => handleCloseAttempt(onClose)} />
            <SaveButton onClick={handleSave} isSaving={isSaving} isSuccess={isSuccess} label="Update Password" />
          </StickyActionFooter>
        }
      >
        <FormSection title="Security Credentials">
          <FormRow>
            <FormInput 
              label="Current Password" 
              type="password"
              value={formData.currentPassword}
              onChange={(e) => handleChange('currentPassword', e.target.value)}
              placeholder="••••••••"
              error={errors.currentPassword}
            />
          </FormRow>
          <FormRow>
            <FormInput 
              label="New Password" 
              type="password"
              value={formData.newPassword}
              onChange={(e) => handleChange('newPassword', e.target.value)}
              placeholder="Min. 8 characters"
              error={errors.newPassword}
            />
            <FormInput 
              label="Confirm New Password" 
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => handleChange('confirmPassword', e.target.value)}
              placeholder="••••••••"
              error={errors.confirmPassword}
            />
          </FormRow>
        </FormSection>

        <FormSection title="Security Activity">
          <div className="space-y-3">
            <div className="flex items-center gap-4 p-4 bg-slate-50 border border-slate-100 rounded-2xl">
              <div className="p-2.5 bg-indigo-100 text-indigo-600 rounded-xl">
                <Laptop size={18} />
              </div>
              <div className="flex-1">
                <p className="text-xs font-bold text-slate-900">Current Session</p>
                <p className="text-[10px] font-medium text-slate-400">Current Device</p>
              </div>
              <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg uppercase">Active</span>
            </div>
            <div className="flex items-center gap-4 p-4 bg-white border border-slate-100 rounded-2xl opacity-60">
              <div className="p-2.5 bg-slate-100 text-slate-400 rounded-xl">
                <History size={18} />
              </div>
              <div className="flex-1">
                <p className="text-xs font-bold text-slate-900">Last Password Change</p>
                <p className="text-[10px] font-medium text-slate-400">14 days ago • April 26, 2026</p>
              </div>
            </div>
          </div>
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
