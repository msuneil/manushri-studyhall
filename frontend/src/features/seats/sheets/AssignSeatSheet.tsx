import { useState, useEffect } from 'react';
import { BottomSheet } from '../../../components/common/BottomSheet';
import { StickyActionFooter } from '../../../components/common/StickyActionFooter';
import { CancelButton } from '../../../components/common/CancelButton';
import { Avatar } from '../../../components/common/Avatar';
import { Armchair, Search, UserPlus, ArrowRight, IndianRupee, Check, CheckCircle2 } from 'lucide-react';
import type { Seat, Occupant } from '../types';

interface AssignSeatSheetProps {
  isOpen: boolean;
  onClose: () => void;
  seat: Seat | null;
  occupants: Occupant[];
  onAssign: (occupantId: string, data: any) => void;
  onTriggerAddNewOccupant: () => void;
}

export function AssignSeatSheet({ 
  isOpen, 
  onClose, 
  seat, 
  occupants, 
  onAssign, 
  onTriggerAddNewOccupant 
}: AssignSeatSheetProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOccupant, setSelectedOccupant] = useState<Occupant | null>(null);
  
  const [assignmentData, setAssignmentData] = useState({
    plan: 'Full Day',
    joinDate: new Date().toISOString().split('T')[0],
    collectFee: false,
    notes: ''
  });

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setSearchQuery('');
      setSelectedOccupant(null);
      setAssignmentData({
        plan: 'Full Day',
        joinDate: new Date().toISOString().split('T')[0],
        collectFee: false,
        notes: ''
      });
    }
  }, [isOpen]);

  if (!seat) return null;

  // Filter occupants who do not have an active seat already
  const availableOccupants = occupants.filter(o => 
    o.status === 'Active' && 
    o.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleNext = () => {
    if (step === 1 && selectedOccupant) {
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    }
  };

  const handleBack = () => {
    if (step === 2) setStep(1);
    if (step === 3) setStep(2);
  };

  const handleAssignSubmit = () => {
    if (selectedOccupant) {
      onAssign(selectedOccupant.id, assignmentData);
    }
  };

  return (
    <BottomSheet 
      isOpen={isOpen} 
      onClose={onClose} 
      title={`Assign Seat ${seat.number}`}
      size="scroll"
      footer={
        <StickyActionFooter>
          {step === 1 ? (
            <>
              <CancelButton onClick={onClose} />
              <button 
                disabled={!selectedOccupant}
                onClick={handleNext}
                className="flex-1 py-4 bg-indigo-600 text-white rounded-[1.25rem] font-black text-sm uppercase tracking-widest shadow-xl shadow-indigo-500/30 active:scale-[0.98] transition-all disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center gap-2"
              >
                Continue
                <ArrowRight size={18} />
              </button>
            </>
          ) : step === 2 ? (
            <div className="flex gap-4 w-full">
              <button 
                onClick={handleBack} 
                className="px-8 py-4 bg-slate-100 text-slate-700 rounded-[1.25rem] font-bold text-sm uppercase tracking-wider active:scale-[0.98] transition-all"
              >
                Back
              </button>
              <button 
                onClick={handleNext} 
                className="flex-1 py-4 bg-indigo-600 text-white rounded-[1.25rem] font-black text-xs sm:text-sm uppercase tracking-wider shadow-xl shadow-indigo-500/30 active:scale-[0.98] transition-all whitespace-nowrap px-4"
              >
                Review Summary
              </button>
            </div>
          ) : (
            <div className="flex gap-4 w-full">
              <button 
                onClick={handleBack} 
                className="px-8 py-4 bg-slate-100 text-slate-700 rounded-[1.25rem] font-bold text-sm uppercase tracking-wider active:scale-[0.98] transition-all"
              >
                Edit
              </button>
              <button 
                onClick={handleAssignSubmit} 
                className="flex-1 py-4 bg-indigo-600 text-white rounded-[1.25rem] font-black text-xs sm:text-sm uppercase tracking-wider shadow-xl shadow-indigo-500/30 active:scale-[0.98] transition-all whitespace-nowrap px-4"
              >
                Confirm & Allocate
              </button>
            </div>
          )}
        </StickyActionFooter>
      }
    >
      <div className="space-y-6 pb-6">
        {/* Seat Badge Banner */}
        <div className="p-4 bg-indigo-50 rounded-3xl flex items-center justify-between border border-indigo-100 shadow-sm">
          <div>
            <p className="text-[10px] font-black text-indigo-600 uppercase tracking-wider">Allocation Target</p>
            <p className="text-2xl font-black text-slate-900">{seat.number}</p>
          </div>
          <div className="p-3 bg-white rounded-2xl shadow-sm text-indigo-600 border border-indigo-50">
            <Armchair size={28} strokeWidth={2.5} />
          </div>
        </div>

        {/* PROGRESS INDICATOR BAR */}
        <div className="flex items-center gap-2 px-1">
          <div className={`h-1.5 flex-1 rounded-full ${step >= 1 ? 'bg-indigo-600' : 'bg-slate-100'}`} />
          <div className={`h-1.5 flex-1 rounded-full ${step >= 2 ? 'bg-indigo-600' : 'bg-slate-100'}`} />
          <div className={`h-1.5 flex-1 rounded-full ${step >= 3 ? 'bg-indigo-600' : 'bg-slate-100'}`} />
        </div>

        {/* STEP 1: Select Occupant */}
        {step === 1 && (
          <div className="space-y-4">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Select Occupant</label>
            
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Search active occupants..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border-0 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-sm transition-all"
              />
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto scrollbar-hide">
              {availableOccupants.length === 0 ? (
                <div className="text-center py-6 text-slate-400 text-xs font-bold">
                  No matching active occupants found.
                </div>
              ) : (
                availableOccupants.map(occ => (
                  <button 
                    key={occ.id}
                    onClick={() => setSelectedOccupant(occ)}
                    className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${
                      selectedOccupant?.id === occ.id 
                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-500/20' 
                        : 'bg-white border-slate-100 text-slate-900 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3 text-left">
                      <Avatar name={occ.name} size="sm" className={selectedOccupant?.id === occ.id ? 'ring-2 ring-white shadow-none' : ''} />
                      <div>
                        <p className="text-sm font-bold leading-snug">{occ.name}</p>
                        <p className={`text-[10px] ${selectedOccupant?.id === occ.id ? 'text-indigo-100' : 'text-slate-400'}`}>
                          {occ.phone}
                        </p>
                      </div>
                    </div>
                    <UserPlus size={18} className={selectedOccupant?.id === occ.id ? 'text-white opacity-90' : 'text-slate-400'} />
                  </button>
                ))
              )}

              <button 
                onClick={onTriggerAddNewOccupant}
                className="w-full p-4 rounded-2xl border-2 border-dashed border-slate-200 text-slate-500 hover:text-slate-800 hover:border-slate-400 transition-all font-bold text-sm flex items-center justify-center gap-2"
              >
                + Add New Occupant Profile
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Plan & Pricing */}
        {step === 2 && selectedOccupant && (
          <div className="space-y-5">
            <div className="flex items-center gap-3 p-4 bg-white border border-slate-100 rounded-2xl shadow-sm">
              <Avatar name={selectedOccupant.name} size="md" />
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase">Selected Candidate</p>
                <p className="text-base font-black text-slate-900 leading-none mt-1">{selectedOccupant.name}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Plan Type</label>
                <select 
                  value={assignmentData.plan}
                  onChange={(e) => setAssignmentData({...assignmentData, plan: e.target.value})}
                  className="w-full px-4 py-3.5 bg-slate-50 border-0 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-bold"
                >
                  <option value="Full Day">Full Day</option>
                  <option value="Half Day">Half Day</option>
                  <option value="Morning">Morning</option>
                  <option value="Evening">Evening</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Joining Date</label>
                <input 
                  type="date" 
                  value={assignmentData.joinDate}
                  onChange={(e) => setAssignmentData({...assignmentData, joinDate: e.target.value})}
                  className="w-full px-4 py-3.5 bg-slate-50 border-0 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-bold"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Notes (Optional)</label>
              <textarea 
                placeholder="Specific instructions, e.g. laptop verification completed, corner desk request..."
                value={assignmentData.notes}
                onChange={(e) => setAssignmentData({...assignmentData, notes: e.target.value})}
                className="w-full px-4 py-3.5 bg-slate-50 border-0 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-medium h-24 resize-none leading-relaxed"
              />
            </div>

            {/* Collect Fee Option */}
            <label className="flex items-center gap-3 p-4 bg-emerald-50/50 border border-emerald-100 rounded-2xl cursor-pointer active:scale-[0.98] transition-all select-none">
              <div className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${
                assignmentData.collectFee ? 'bg-emerald-600 text-white' : 'bg-white border border-slate-200'
              }`}>
                {assignmentData.collectFee && <Check size={14} strokeWidth={3} />}
              </div>
              <input 
                type="checkbox" 
                className="hidden" 
                checked={assignmentData.collectFee}
                onChange={(e) => setAssignmentData({...assignmentData, collectFee: e.target.checked})}
              />
              <div className="flex-1">
                <p className="text-sm font-bold text-emerald-900 leading-tight">Collect first month fee now</p>
                <p className="text-[10px] font-medium text-emerald-600">₹{selectedOccupant.monthlyFee} will be marked as Paid</p>
              </div>
              <IndianRupee size={20} className="text-emerald-600 opacity-40 shrink-0" />
            </label>
          </div>
        )}

        {/* STEP 3: Review Confirmation */}
        {step === 3 && selectedOccupant && (
          <div className="space-y-5">
            <div className="bg-slate-900 rounded-3xl p-6 text-white space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Seat Number</span>
                <span className="text-xl font-black">{seat.number}</span>
              </div>
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Occupant Candidate</span>
                <span className="text-xl font-black">{selectedOccupant.name}</span>
              </div>
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Selected Plan</span>
                <span className="text-xl font-black">{assignmentData.plan}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Monthly Amount</span>
                <span className="text-xl font-black text-emerald-400">₹{selectedOccupant.monthlyFee}</span>
              </div>
            </div>

            {assignmentData.collectFee && (
              <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800">
                <CheckCircle2 size={24} className="text-emerald-600 shrink-0" />
                <span className="text-sm font-bold">First month fee (₹{selectedOccupant.monthlyFee}) will be marked as Collected successfully.</span>
              </div>
            )}
          </div>
        )}
      </div>
    </BottomSheet>
  );
}
