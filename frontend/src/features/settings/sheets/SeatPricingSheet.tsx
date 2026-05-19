import { useState, useEffect } from 'react';
import { BottomSheet } from '../../../components/common/BottomSheet';
import { StickyActionFooter } from '../../../components/common/StickyActionFooter';
import { FormSection, FormRow, FormInput, FormToggle } from '../../../components/common/FormAtoms';
import { SaveButton } from '../../../components/common/SaveButton';
import { CancelButton } from '../../../components/common/CancelButton';
import { useUnsavedChanges } from '../../../hooks/useUnsavedChanges';
import { ConfirmationDialog } from '../../../components/common/ConfirmationDialog';

interface SeatPricingSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

export function SeatPricingSheet({ isOpen, onClose, onSave }: SeatPricingSheetProps) {
  const [formData, setFormData] = useState({
    acFull: '1500',
    acHalf: '800',
    nonAcFull: '1000',
    nonAcHalf: '600',
    enableHalfDay: true,
    enableSpecialPlans: false
  });

  const [isSaving, setIsSaving] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const { markDirty, markClean, handleCloseAttempt, showConfirmDialog, confirmDiscard, cancelDiscard } = useUnsavedChanges();

  useEffect(() => {
    if (isOpen) {
      markClean();
      setIsSuccess(false);
    }
  }, [isOpen, markClean]);

  const handleChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    markDirty();
  };

  const handleSave = async () => {
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
        title="Seat Pricing"
        size="scroll"
        footer={
          <StickyActionFooter>
            <CancelButton onClick={() => handleCloseAttempt(onClose)} />
            <SaveButton onClick={handleSave} isSaving={isSaving} isSuccess={isSuccess} />
          </StickyActionFooter>
        }
      >
        <FormSection title="Pricing Configuration">
          <FormToggle 
            label="Enable Half-Day Pricing" 
            checked={formData.enableHalfDay}
            onChange={(checked) => handleChange('enableHalfDay', checked)}
            helper="Allow occupants to book seats for half the day at a different rate."
          />
        </FormSection>

        <FormSection title="AC Hall Pricing (Monthly)">
          <FormRow>
            <div className={`grid gap-4 ${formData.enableHalfDay ? 'grid-cols-2' : 'grid-cols-1'}`}>
              <FormInput 
                label="Full-Day Price" 
                type="number"
                value={formData.acFull}
                onChange={(e) => handleChange('acFull', e.target.value)}
                placeholder="₹ 1500"
              />
              {formData.enableHalfDay && (
                <FormInput 
                  label="Half-Day Price" 
                  type="number"
                  value={formData.acHalf}
                  onChange={(e) => handleChange('acHalf', e.target.value)}
                  placeholder="₹ 800"
                />
              )}
            </div>
          </FormRow>
        </FormSection>

        <FormSection title="Non-AC Hall Pricing (Monthly)">
          <FormRow>
            <div className={`grid gap-4 ${formData.enableHalfDay ? 'grid-cols-2' : 'grid-cols-1'}`}>
              <FormInput 
                label="Full-Day Price" 
                type="number"
                value={formData.nonAcFull}
                onChange={(e) => handleChange('nonAcFull', e.target.value)}
                placeholder="₹ 1000"
              />
              {formData.enableHalfDay && (
                <FormInput 
                  label="Half-Day Price" 
                  type="number"
                  value={formData.nonAcHalf}
                  onChange={(e) => handleChange('nonAcHalf', e.target.value)}
                  placeholder="₹ 600"
                />
              )}
            </div>
          </FormRow>
        </FormSection>

        <FormSection title="Advanced Plans">
          <FormToggle 
            label="Enable Special Plans" 
            checked={formData.enableSpecialPlans}
            onChange={(checked) => handleChange('enableSpecialPlans', checked)}
            helper="Offer hourly, weekend, or early bird discounts."
          />
          {formData.enableSpecialPlans && (
            <div className="mt-4 bg-slate-50 border border-slate-100 rounded-2xl p-4 animate-in fade-in slide-in-from-top-2">
              <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Upcoming Feature</p>
              <p className="text-xs text-slate-500">Hourly plans and weekend-only plans configuration will be available in the next update.</p>
            </div>
          )}
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
