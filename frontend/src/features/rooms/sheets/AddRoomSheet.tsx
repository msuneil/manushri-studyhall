import { useState, useEffect } from 'react';
import { BottomSheet } from '../../../components/common/BottomSheet';
import { StickyActionFooter } from '../../../components/common/StickyActionFooter';
import { FormSection, FormRow, FormInput, FormSelect, FormTextarea } from '../../../components/common/FormAtoms';
import { SaveButton } from '../../../components/common/SaveButton';
import { CancelButton } from '../../../components/common/CancelButton';
import { useUnsavedChanges } from '../../../hooks/useUnsavedChanges';
import { ConfirmationDialog } from '../../../components/common/ConfirmationDialog';
import { isRequired } from '../../../utils/validation';
import { useData } from '../../../contexts/DataContext';

interface AddRoomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  room?: any;
}

export function AddRoomSheet({ isOpen, onClose, onSave, room }: AddRoomSheetProps) {
  const { createRoom, updateRoom, batchCreateSeats } = useData();

  const [formData, setFormData] = useState({
    name: '',
    type: 'AC Hall',
    totalSeats: '',
    seatPrefix: '',
    genderRestriction: 'Mixed',
    pricing: '',
    pricingType: 'Monthly',
    rules: '',
    status: 'Active',
    notes: ''
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
      if (room) {
        setFormData({
          name: room.name,
          type: room.type,
          totalSeats: String(room.totalSeats),
          seatPrefix: room.seatPrefix,
          genderRestriction: room.genderRestriction,
          pricing: room.pricingPreview ? room.pricingPreview.replace(/[^0-9]/g, '') : '2000',
          pricingType: 'Monthly',
          rules: room.rulesPreview ? room.rulesPreview.join(', ') : '',
          status: room.status,
          notes: room.notes || ''
        });
      } else {
        setFormData({
          name: '',
          type: 'AC Hall',
          totalSeats: '',
          seatPrefix: '',
          genderRestriction: 'Mixed',
          pricing: '',
          pricingType: 'Monthly',
          rules: '',
          status: 'Active',
          notes: ''
        });
      }
    }
  }, [isOpen, room, markClean]);

  const handleChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    markDirty();
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!isRequired(formData.name)) newErrors.name = 'Room name is required';
    if (!room) {
      if (!isRequired(formData.totalSeats)) newErrors.totalSeats = 'Total seats required';
      if (!isRequired(formData.seatPrefix)) newErrors.seatPrefix = 'Seat prefix required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setIsSaving(true);
    try {
      if (room) {
        // Edit mode
        await updateRoom(room.id, {
          name: formData.name,
          type: formData.type as any,
          status: formData.status,
          genderRestriction: formData.genderRestriction,
          notes: formData.notes
        } as any);
      } else {
        // Create mode
        const newRoomId = await createRoom(formData.name, formData.type as any);
        
        // Also save extra custom fields on the document
        await updateRoom(newRoomId, {
          status: formData.status,
          seatPrefix: formData.seatPrefix,
          genderRestriction: formData.genderRestriction,
          notes: formData.notes
        } as any);

        // Batch create seats!
        const count = parseInt(formData.totalSeats, 10);
        if (count > 0) {
          await batchCreateSeats(newRoomId, count, formData.seatPrefix);
        }
      }
      setIsSuccess(true);
      markClean();
      setTimeout(() => onSave(), 1000);
    } catch (e) {
      console.error(e);
      setErrors({ name: 'Failed to save room to database' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <BottomSheet 
        isOpen={isOpen} 
        onClose={() => handleCloseAttempt(onClose)} 
        title={room ? "Edit Room" : "Add New Room"}
        size="scroll"
        footer={
          <StickyActionFooter>
            <CancelButton onClick={() => handleCloseAttempt(onClose)} />
            <SaveButton onClick={handleSave} isSaving={isSaving} isSuccess={isSuccess} label={room ? "Save Changes" : "Create Room"} />
          </StickyActionFooter>
        }
      >
        <FormSection title="Basic Details">
          <FormRow>
            <FormInput 
              label="Room Name" 
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="e.g. Hall A, Premium Zone"
              error={errors.name}
              required
            />
          </FormRow>
          <FormRow>
            <div className="grid grid-cols-2 gap-4">
              <FormSelect 
                label="Room Type" 
                value={formData.type}
                onChange={(e) => handleChange('type', e.target.value)}
              >
                <option value="AC Hall">AC Hall</option>
                <option value="Non-AC Hall">Non-AC Hall</option>
              </FormSelect>
              <FormSelect 
                label="Gender Restriction" 
                value={formData.genderRestriction}
                onChange={(e) => handleChange('genderRestriction', e.target.value)}
              >
                <option value="Mixed">Mixed</option>
                <option value="Male">Male Only</option>
                <option value="Female">Female Only</option>
              </FormSelect>
            </div>
          </FormRow>
        </FormSection>

        {!room && (
          <FormSection title="Capacity & Naming">
            <FormRow>
              <div className="grid grid-cols-2 gap-4">
                <FormInput 
                  label="Total Seats" 
                  type="number"
                  value={formData.totalSeats}
                  onChange={(e) => handleChange('totalSeats', e.target.value)}
                  placeholder="e.g. 50"
                  error={errors.totalSeats}
                  required
                />
                <FormInput 
                  label="Seat Prefix" 
                  value={formData.seatPrefix}
                  onChange={(e) => handleChange('seatPrefix', e.target.value)}
                  placeholder="e.g. AC, NAC, PRM"
                  error={errors.seatPrefix}
                  required
                  helper="Used for future seat generation."
                />
              </div>
            </FormRow>
          </FormSection>
        )}

        <FormSection title="Pricing & Rules">
          <FormRow>
            <div className="grid grid-cols-2 gap-4">
              <FormInput 
                label="Base Pricing (₹)" 
                type="number"
                value={formData.pricing}
                onChange={(e) => handleChange('pricing', e.target.value)}
                placeholder="e.g. 2000"
              />
              <FormSelect 
                label="Pricing Type" 
                value={formData.pricingType}
                onChange={(e) => handleChange('pricingType', e.target.value)}
              >
                <option value="Monthly">Monthly</option>
                <option value="Quarterly">Quarterly</option>
                <option value="Half Day">Half Day</option>
              </FormSelect>
            </div>
          </FormRow>
          <FormRow>
            <FormInput 
              label="Room Rules (Short Tags)" 
              value={formData.rules}
              onChange={(e) => handleChange('rules', e.target.value)}
              placeholder="e.g. Silent Zone, Laptop Only"
              helper="Comma-separated tags for preview."
            />
          </FormRow>
        </FormSection>

        <FormSection title="Operational Settings">
          <FormRow>
            <FormSelect 
              label="Initial Status" 
              value={formData.status}
              onChange={(e) => handleChange('status', e.target.value)}
              helper="'Full' state is automatically derived from occupancy."
            >
              <option value="Active">Active</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Inactive">Inactive</option>
            </FormSelect>
          </FormRow>
          <FormRow>
            <FormTextarea 
              label="Internal Notes" 
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              placeholder="Operational notes about this room..."
            />
          </FormRow>
        </FormSection>
      </BottomSheet>

      <ConfirmationDialog 
        isOpen={showConfirmDialog}
        title="Discard Room?"
        description="You have unsaved details. Are you sure you want to discard this room?"
        confirmLabel="Discard"
        cancelLabel="Continue Editing"
        onConfirm={confirmDiscard}
        onCancel={cancelDiscard}
      />
    </>
  );
}
