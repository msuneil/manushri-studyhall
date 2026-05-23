import { useState } from 'react';
import { BottomSheet } from '../../../components/common/BottomSheet';
import { StickyActionFooter } from '../../../components/common/StickyActionFooter';
import { FormSection, FormRow, FormInput, FormSelect } from '../../../components/common/FormAtoms';
import { CancelButton } from '../../../components/common/CancelButton';
import { isRequired } from '../../../utils/validation';
import { Avatar } from '../../../components/common/Avatar';
import { occupants } from '../../../data/mockData';
import { useToast } from '../../../components/Toast';
import { validateImageUpload } from '../../../lib/firebase/storage';

interface NewOccupantSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (newOccupant: any) => void;
}

export function NewOccupantSheet({ isOpen, onClose, onAdd }: NewOccupantSheetProps) {
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    emergencyContact: '',
    aadhaar: '',
    planType: 'Full Day',
    monthlyFee: '2000',
    profileImage: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (field: string, value: string) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      // Sync fee defaults based on plan type for quick onboarding
      if (field === 'planType') {
        updated.monthlyFee = value === 'Full Day' ? '2000' : '1200';
      }
      return updated;
    });
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!isRequired(formData.name)) newErrors.name = 'Full name is required';
    if (!isRequired(formData.phone)) newErrors.phone = 'Phone number is required';
    if (!isRequired(formData.aadhaar)) newErrors.aadhaar = 'Aadhaar/ID placeholder required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddSubmit = () => {
    if (!validate()) return;
    
    // Create new occupant object matching types
    const newOccupant = {
      id: `occ_${Date.now()}`,
      name: formData.name,
      phone: formData.phone,
      email: formData.email || `${formData.name.toLowerCase().replace(/\s+/g, '')}@email.com`,
      joinDate: new Date().toISOString().split('T')[0],
      status: 'Active' as const,
      attendanceRate: 100,
      monthlyFee: Number(formData.monthlyFee),
      emergencyContact: formData.emergencyContact,
      planType: formData.planType as any,
      notes: 'Newly onboarded occupant.',
      aadhaarPlaceholder: `XXXX-XXXX-${formData.aadhaar.slice(-4) || '9999'}`,
      profileImage: formData.profileImage,
      paymentStatus: 'Pending' as const,
      lastPaymentDate: 'None',
      lastAttendanceDate: 'None',
      attendanceTrend: 'Stable' as const
    };

    onAdd(newOccupant);
    onClose();
  };

  return (
    <BottomSheet 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Add New Occupant"
      size="scroll"
      footer={
        <StickyActionFooter>
          <CancelButton onClick={onClose} />
          <button 
            onClick={handleAddSubmit}
            className="flex-1 py-4 bg-indigo-600 text-white rounded-[1.25rem] font-black text-sm uppercase tracking-widest shadow-xl shadow-indigo-500/30 active:scale-[0.98] transition-all"
          >
            Onboard Occupant
          </button>
        </StickyActionFooter>
      }
    >
      <div className="space-y-6 pb-6">
        {/* Live Initials Avatar & Deterministic Color Preview */}
        <div className="flex flex-col items-center gap-3 p-5 bg-slate-50 border border-slate-200/60 rounded-3xl text-center">
          <Avatar name={formData.name || 'New Occupant'} imageUrl={formData.profileImage} size="xl" />
          <div className="w-full">
            <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest mb-2">Member Photograph (Optional)</h4>
            <input 
              type="file" 
              accept="image/png, image/jpeg, image/webp"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const check = validateImageUpload(file, 1 * 1024 * 1024); // 1MB Profile Photo Limit
                  if (!check.valid) {
                    showToast(check.error || "Profile image exceeds 1MB limit.", "error");
                    e.target.value = '';
                    return;
                  }
                  const reader = new FileReader();
                  reader.onloadend = () => {
                    setFormData(prev => ({ ...prev, profileImage: reader.result as string }));
                  };
                  reader.readAsDataURL(file);
                }
              }}
              className="block w-full text-xs text-slate-500 file:mr-4 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-[10px] file:font-black file:uppercase file:tracking-wider file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
            />
            <p className="text-[9px] font-bold text-slate-400 mt-1">PNG, JPG or WEBP (Max 1MB)</p>
          </div>
        </div>

        {/* Duplication Warning Safeguards */}
        {(() => {
          const cleanPhone = formData.phone.trim().replace(/\D/g, '');
          const isDuplicatePhone = cleanPhone && (occupants as any[]).some(o => o.phone && o.phone.trim().replace(/\D/g, '') === cleanPhone);
          const suggestedOccupant = isDuplicatePhone ? (occupants as any[]).find(o => o.phone && o.phone.trim().replace(/\D/g, '') === cleanPhone) : null;
          
          const cleanAadhaar = formData.aadhaar.trim().replace(/\s+/g, '');
          const isDuplicateAadhaar = cleanAadhaar && (occupants as any[]).some(o => o.aadhaarPlaceholder && o.aadhaarPlaceholder.trim().replace(/\s+/g, '') === cleanAadhaar);
          
          return (
            <>
              {isDuplicatePhone && (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl space-y-1">
                  <p className="text-xs font-black text-amber-900 leading-none">⚠️ Duplicate Phone Warning</p>
                  <p className="text-[10px] font-bold text-amber-700 leading-relaxed">
                    This phone number matches existing occupant <strong>{suggestedOccupant?.name}</strong>.
                  </p>
                </div>
              )}
              {isDuplicateAadhaar && (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl space-y-1">
                  <p className="text-xs font-black text-amber-900 leading-none">⚠️ Duplicate Aadhaar Warning</p>
                  <p className="text-[10px] font-bold text-amber-700 leading-relaxed">
                    This Aadhaar/ID placeholder is already associated with an onboarded candidate.
                  </p>
                </div>
              )}
            </>
          );
        })()}

        <FormSection title="Personal Information">
          <FormRow>
            <FormInput 
              label="Full Name" 
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="e.g. Sunil Kumar"
              error={errors.name}
              required
            />
          </FormRow>
          <FormRow>
            <div className="grid grid-cols-2 gap-4">
              <FormInput 
                label="Phone Number" 
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                placeholder="e.g. +91 98765 00000"
                error={errors.phone}
                required
              />
              <FormInput 
                label="Email Address" 
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="e.g. sunil@email.com"
              />
            </div>
          </FormRow>
        </FormSection>

        <FormSection title="Verification & Safety">
          <FormRow>
            <div className="grid grid-cols-2 gap-4">
              <FormInput 
                label="Aadhaar / ID Number" 
                value={formData.aadhaar}
                onChange={(e) => handleChange('aadhaar', e.target.value)}
                placeholder="e.g. 1234 5678 9012"
                error={errors.aadhaar}
                required
              />
              <FormInput 
                label="Emergency Contact" 
                value={formData.emergencyContact}
                onChange={(e) => handleChange('emergencyContact', e.target.value)}
                placeholder="e.g. +91 98765 11111"
              />
            </div>
          </FormRow>
        </FormSection>

        <FormSection title="Initial Subscription">
          <FormRow>
            <div className="grid grid-cols-2 gap-4">
              <FormSelect 
                label="Plan Type" 
                value={formData.planType}
                onChange={(e) => handleChange('planType', e.target.value)}
              >
                <option value="Full Day">Full Day</option>
                <option value="Half Day">Half Day</option>
                <option value="Morning">Morning</option>
                <option value="Evening">Evening</option>
              </FormSelect>
              <FormInput 
                label="Monthly Fee (₹)" 
                type="number"
                value={formData.monthlyFee}
                onChange={(e) => handleChange('monthlyFee', e.target.value)}
              />
            </div>
          </FormRow>
        </FormSection>
      </div>
    </BottomSheet>
  );
}
