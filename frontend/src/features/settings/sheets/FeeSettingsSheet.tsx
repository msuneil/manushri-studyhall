import { useState, useEffect } from "react";
import { BottomSheet } from "../../../components/common/BottomSheet";
import { StickyActionFooter } from "../../../components/common/StickyActionFooter";
import {
  FormSection,
  FormRow,
  FormInput,
  FormToggle,
  FormSelect,
} from "../../../components/common/FormAtoms";
import { SaveButton } from "../../../components/common/SaveButton";
import { CancelButton } from "../../../components/common/CancelButton";
import { useUnsavedChanges } from "../../../hooks/useUnsavedChanges";
import { ConfirmationDialog } from "../../../components/common/ConfirmationDialog";
import { useSettings } from "../SettingsContext";

interface FeeSettingsSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

export function FeeSettingsSheet({
  isOpen,
  onClose,
  onSave,
}: FeeSettingsSheetProps) {
  const { settings, updateSettings } = useSettings();

  const [formData, setFormData] = useState({
    currency: "INR",
    billingCycle: "Monthly",
    dueDate: "5",
    gracePeriod: "2",
    lateFeeEnabled: true,
    lateFeeAmount: "50",
    autoMarkOverdue: true,
  });

  const [isSaving, setIsSaving] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    markDirty,
    markClean,
    handleCloseAttempt,
    showConfirmDialog,
    confirmDiscard,
    cancelDiscard,
  } = useUnsavedChanges();

  useEffect(() => {
    if (isOpen) {
      setFormData({
        currency: "INR",
        billingCycle: "Monthly",
        dueDate: settings.paymentSettings.dueDateDay.toString(),
        gracePeriod: settings.paymentSettings.gracePeriodDays.toString(),
        lateFeeEnabled: settings.paymentSettings.lateFeeAmount > 0,
        lateFeeAmount: settings.paymentSettings.lateFeeAmount.toString(),
        autoMarkOverdue: true,
      });
      markClean();
      setIsSuccess(false);
    }
  }, [isOpen, settings.paymentSettings, markClean]);

  const handleChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    markDirty();
  };

  const handleSave = async () => {
    setIsSaving(true);
    // Persist globally
    updateSettings("paymentSettings", {
      dueDateDay: parseInt(formData.dueDate, 10) || 5,
      gracePeriodDays: parseInt(formData.gracePeriod, 10) || 3,
      lateFeeAmount: formData.lateFeeEnabled
        ? parseInt(formData.lateFeeAmount, 10) || 0
        : 0,
    });
    await new Promise((resolve) => setTimeout(resolve, 1000));
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
        title="Fee Settings"
        size="scroll"
        footer={
          <StickyActionFooter>
            <CancelButton onClick={() => handleCloseAttempt(onClose)} />
            <SaveButton
              onClick={handleSave}
              isSaving={isSaving}
              isSuccess={isSuccess}
            />
          </StickyActionFooter>
        }
      >
        <FormSection title="Billing Configuration">
          <FormRow>
            <div className="grid grid-cols-2 gap-4">
              <FormSelect
                label="Currency"
                value={formData.currency}
                onChange={(e) => handleChange("currency", e.target.value)}
              >
                <option value="INR">₹ INR</option>
                <option value="USD">$ USD</option>
                <option value="EUR">€ EUR</option>
              </FormSelect>
              <FormSelect
                label="Billing Cycle"
                value={formData.billingCycle}
                onChange={(e) => handleChange("billingCycle", e.target.value)}
              >
                <option value="Monthly">Monthly</option>
                <option value="Quarterly">Quarterly</option>
                <option value="Annually">Annually</option>
              </FormSelect>
            </div>
          </FormRow>
        </FormSection>

        <FormSection title="Billing Defaults">
          <FormRow>
            <FormSelect
              label="Default Due Date"
              value={formData.dueDate}
              onChange={(e) => handleChange("dueDate", e.target.value)}
              helper="Day of the month when fees are due for all occupants."
            >
              {[...Array(28)].map((_, i) => (
                <option key={i + 1} value={i + 1}>
                  {i + 1}th of Month
                </option>
              ))}
            </FormSelect>
          </FormRow>
          <FormRow>
            <FormInput
              label="Grace Period (Days)"
              type="number"
              value={formData.gracePeriod}
              onChange={(e) => handleChange("gracePeriod", e.target.value)}
              helper="Number of days allowed after the due date before late fees apply."
            />
          </FormRow>
        </FormSection>

        <FormSection title="Late Fees & Actions">
          <FormToggle
            label="Charge Late Fees"
            checked={formData.lateFeeEnabled}
            onChange={(checked) => handleChange("lateFeeEnabled", checked)}
          />
          {formData.lateFeeEnabled && (
            <FormRow>
              <FormInput
                label="Late Fee Amount"
                type="number"
                value={formData.lateFeeAmount}
                onChange={(e) => handleChange("lateFeeAmount", e.target.value)}
                helper="Daily late fee charged after the grace period."
              />
            </FormRow>
          )}
          <FormToggle
            label="Auto-mark Overdue"
            checked={formData.autoMarkOverdue}
            onChange={(checked) => handleChange("autoMarkOverdue", checked)}
            helper="Automatically mark unpaid fees as Overdue once the grace period ends."
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
