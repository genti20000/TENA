import React, { useState } from 'react';
import { TenancyDetails, defaultDetails } from '../types';
import { cn } from '../lib/utils';
import { 
  User, 
  Home, 
  Calendar, 
  PoundSterling, 
  Zap, 
  Dog, 
  MessageSquarePlus, 
  RotateCcw, 
  Wrench,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Info,
  Loader2,
  Sparkles,
  Plus
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AiAssistance } from './AiAssistance';
import { aiDraftClause } from '../lib/gemini';

interface AgreementFormProps {
  details: TenancyDetails;
  onChange: (details: TenancyDetails) => void;
}

export const AgreementForm: React.FC<AgreementFormProps> = ({ details, onChange }) => {
  const [activeStep, setActiveStep] = useState(0);

  const [casualClause, setCasualClause] = useState('');
  const [clauseCategory, setClauseCategory] = useState('Garden Care');
  const [draftedClause, setDraftedClause] = useState('');
  const [isDraftingClause, setIsDraftingClause] = useState(false);
  const [draftingError, setDraftingError] = useState('');

  const handleDraftClause = async () => {
    if (!casualClause.trim()) return;
    setIsDraftingClause(true);
    setDraftingError('');
    setDraftedClause('');
    try {
      const result = await aiDraftClause(casualClause, clauseCategory);
      setDraftedClause(result);
    } catch (error: any) {
      console.error(error);
      setDraftingError(error.message || 'Failed to draft clause.');
    } finally {
      setIsDraftingClause(false);
    }
  };

  const handleAppendClause = () => {
    if (!draftedClause) return;
    const currentTerms = details.otherTerms ? details.otherTerms.trim() : '';
    const updatedTerms = currentTerms 
      ? `${currentTerms}\n\n${draftedClause}` 
      : draftedClause;
    onChange({ ...details, otherTerms: updatedTerms });
    setDraftedClause('');
    setCasualClause('');
  };

  const steps = [
    { id: 'jurisdiction', title: 'Location', icon: Info, desc: 'England or Wales' },
    { id: 'parties', title: 'Parties', icon: User, desc: 'Landlord & tenant legal info' },
    { id: 'property', title: 'Property', icon: Home, desc: 'Address & specifications' },
    { id: 'term', title: 'Term', icon: Calendar, desc: 'Start date & tenancy type' },
    { id: 'financials', title: 'Financials', icon: PoundSterling, desc: 'Rent, deposit & protection' },
    { id: 'utilities', title: 'Utilities', icon: Zap, desc: 'Utility bill responsibility' },
    { id: 'maintenance', title: 'Maintenance', icon: Wrench, desc: 'Upkeep & repairs split' },
    { id: 'pets', title: 'Pets', icon: Dog, desc: 'Pet policy & rules' },
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    onChange({ ...details, [name]: value });
  };

  const handleTermLengthChange = (value: string) => {
    onChange({ ...details, termLength: value });
  };

  const handleUtilityToggle = (util: string) => {
    const newUtilities = details.utilities.includes(util)
      ? details.utilities.filter((u) => u !== util)
      : [...details.utilities, util];
    onChange({ ...details, utilities: newUtilities });
  };

  const isStepComplete = (stepIndex: number): boolean => {
    switch (stepIndex) {
      case 0:
        return !!details.jurisdiction;
      case 1:
        return !!(details.landlordName && details.landlordName !== '[Landlord Name]' && 
                  details.tenantName && details.tenantName !== '[Tenant Name]');
      case 2:
        return !!(details.propertyAddress && details.propertyAddress !== '[Property Address]');
      case 3:
        return !!(details.startDate && details.startDate !== '[Start Date]');
      case 4:
        return !!(details.rentAmount && details.rentAmount !== '[Rent Amount]' && 
                  details.depositAmount && details.depositAmount !== '[Deposit Amount]');
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (activeStep < steps.length - 1) {
      setActiveStep((prev) => prev + 1);
    }
  };

  const prevStep = () => {
    if (activeStep > 0) {
      setActiveStep((prev) => prev - 1);
    }
  };

  const currentStepInfo = steps[activeStep];
  const StepIcon = currentStepInfo.icon;
  const completionPercent = Math.round(((activeStep + 1) / steps.length) * 100);

  const Input = ({ label, name, placeholder, type = 'text' }: { label: string; name: keyof TenancyDetails; placeholder?: string; type?: string }) => (
    <div className="space-y-1">
      <label className="text-xs font-semibold text-gray-600 block">{label}</label>
      <input
        type={type}
        name={name}
        value={details[name] as string}
        onChange={handleChange}
        placeholder={placeholder}
        className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-all"
      />
    </div>
  );

  return (
    <div className="bg-white/75 backdrop-blur-sm h-full flex flex-col border border-black/5 rounded-3xl shadow-[0_15px_40px_rgba(15,23,42,0.08)] overflow-hidden">
      {/* Dynamic Stepper Header */}
      <div className="p-5 md:p-6 border-b border-black/5 bg-gradient-to-b from-white to-slate-50/70">
        <div className="flex items-center justify-between mb-4 gap-3">
          <div>
            <h2 className="text-xl font-serif font-bold italic text-slate-900">Draft Assistant</h2>
            <div className="text-[10px] text-slate-400 mt-0.5 uppercase tracking-widest font-semibold flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
              UK Tenancy Wizard
            </div>
          </div>
          <button 
            onClick={() => {
              onChange(defaultDetails);
              setActiveStep(0);
            }}
            className="text-[10px] font-bold text-slate-400 hover:text-slate-900 transition-colors uppercase tracking-widest flex items-center gap-1 cursor-pointer"
            title="Reset to default placeholders"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </button>
        </div>

        {/* Mini Step Badges / Progress Nav */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:flex sm:flex-nowrap sm:gap-1.5 overflow-x-auto py-1 no-scrollbar select-none">
          {steps.map((step, idx) => {
            const IconComponent = step.icon;
            const isActive = idx === activeStep;
            const isCompleted = isStepComplete(idx) && idx < activeStep;

            return (
              <button
                key={step.id}
                onClick={() => setActiveStep(idx)}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 p-2 rounded-xl transition-all relative flex-shrink-0 cursor-pointer min-w-0 shadow-[0_1px_0_rgba(255,255,255,0.8)_inset]",
                  isActive 
                    ? "bg-slate-900 text-white shadow-sm" 
                    : isCompleted 
                    ? "bg-emerald-50 border border-emerald-200 text-emerald-700" 
                    : "bg-slate-50 border border-slate-200 text-slate-500 hover:bg-slate-100"
                )}
                title={`${step.title}: ${step.desc}`}
              >
                <IconComponent className="w-4 h-4" />
                <span className="text-[8px] sm:text-[9px] font-bold uppercase tracking-wide leading-none text-center whitespace-normal sm:whitespace-nowrap">
                  {step.title}
                </span>
              </button>
            );
          })}
        </div>

        {/* Overall Progress Bar */}
        <div className="mt-4 space-y-1.5">
          <div className="flex items-center justify-between text-[9px] font-bold uppercase tracking-[0.18em] text-gray-400">
            <span>Progress</span>
            <span>{completionPercent}% complete</span>
          </div>
          <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
            <motion.div 
              className="bg-slate-900 h-full rounded-full"
              initial={{ width: '0%' }}
              animate={{ width: `${completionPercent}%` }}
              transition={{ type: 'spring', stiffness: 80, damping: 15 }}
            />
          </div>
        </div>
      </div>

      {/* Step Contents Area */}
      <div className="flex-1 overflow-y-auto p-5 md:p-6">
        <div className="mb-5">
          <div className="flex items-center gap-2 text-gray-400 mb-1">
            <StepIcon className="w-5 h-5 text-slate-900" />
            <span className="text-[10px] font-bold uppercase tracking-widest">
              Step {activeStep + 1} of {steps.length}
            </span>
          </div>
          <h3 className="text-lg sm:text-xl font-serif font-bold text-slate-900 leading-tight">
            {currentStepInfo.title}
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            {currentStepInfo.desc}
          </p>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeStep}
            initial={{ opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -15 }}
            transition={{ duration: 0.18 }}
            className="space-y-4 sm:space-y-5"
          >
            {activeStep === 0 && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl border border-amber-200 bg-amber-50 text-amber-900 text-xs leading-relaxed">
                  <p className="font-bold uppercase tracking-wider text-[10px] mb-1">Where is the property located?</p>
                  <p className="mb-3">Choose the jurisdiction first so we can show the correct drafting path.</p>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => onChange({ ...details, jurisdiction: 'england' })}
                      className={cn(
                        'rounded-xl border px-3 py-2 font-bold',
                        details.jurisdiction === 'england' ? 'bg-slate-900 text-white border-slate-900' : 'bg-white border-slate-200'
                      )}
                    >
                      England
                    </button>
                    <button
                      type="button"
                      onClick={() => onChange({ ...details, jurisdiction: 'wales' })}
                      className={cn(
                        'rounded-xl border px-3 py-2 font-bold',
                        details.jurisdiction === 'wales' ? 'bg-slate-900 text-white border-slate-900' : 'bg-white border-slate-200'
                      )}
                    >
                      Wales
                    </button>
                  </div>
                </div>

                {details.jurisdiction === 'wales' ? (
                  <div className="p-4 rounded-2xl border border-rose-200 bg-rose-50 text-rose-900 text-sm space-y-2">
                    <p className="font-bold">Wales uses occupation contracts under Renting Homes (Wales).</p>
                    <p>This wizard will only show a Wales information checklist and will not generate an English tenancy agreement.</p>
                  </div>
                ) : (
                  <>
                    <AiAssistance 
                      onFill={(parsedDetails) => onChange({ ...details, ...parsedDetails })} 
                      currentDetails={details}
                    />
                    
                    <div className="border-t border-gray-100 my-2 pt-2" />

                    <Input label="Landlord Legal Name" name="landlordName" placeholder="e.g. John Doe" />
                    <Input label="Landlord Service Address" name="landlordAddress" placeholder="Service Address in England/Wales" />
                    <Input label="Tenant Full Name" name="tenantName" placeholder="e.g. Jane Smith" />
                    <div className="p-3 bg-sky-50 border border-sky-100 rounded-xl text-xs text-sky-700 flex gap-2">
                      <Info className="w-4 h-4 flex-shrink-0 mt-0.5 text-sky-500" />
                      <p>In England, landlords must provide tenants with an address for serving notices.</p>
                    </div>
                  </>
                )}
              </div>
            )}

            {activeStep === 1 && details.jurisdiction === 'england' && (
              <div className="space-y-4">
                <Input label="Tenancy Property Address" name="propertyAddress" placeholder="Include post town and postcode" />
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-600 block">Property Description</label>
                  <textarea
                    name="propertyDescription"
                    value={details.propertyDescription}
                    onChange={handleChange}
                    placeholder="e.g. A three-bedroom semi-detached house with private driveway and rear garden."
                    className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-all min-h-[100px]"
                  />
                </div>
              </div>
            )}

            {activeStep === 2 && details.jurisdiction === 'england' && (
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-600 block">Contract/Term Length</label>
                  <select
                    name="termLength"
                    value={details.termLength}
                    onChange={(e) => handleTermLengthChange(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black"
                  >
                    <option value="6 months">6 months</option>
                    <option value="12 months">12 months</option>
                    <option value="18 months">18 months</option>
                    <option value="24 months">24 months</option>
                    <option value="continuous">Continuous / periodic tenancy</option>
                  </select>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input label="Start Date" name="startDate" type="date" />
                  <Input label="End Date" name="endDate" type="date" />
                </div>
                <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl text-xs text-amber-700 flex gap-2">
                  <Info className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-500" />
                  <p>England drafting now uses an assured periodic tenancy from the start. Keep the start date clear and avoid fixed-term AST language.</p>
                </div>
              </div>
            )}

            {activeStep === 3 && details.jurisdiction === 'england' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input label="Rent Amount" name="rentAmount" placeholder="e.g. £1,250" />
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-600 block">Frequency</label>
                    <select
                      name="rentFrequency"
                      value={details.rentFrequency}
                      onChange={handleChange}
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black"
                    >
                      <option value="monthly">Monthly</option>
                      <option value="weekly">Weekly</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input label="Rent Due Date" name="rentDueDate" placeholder="e.g. 1st day" />
                  <Input label="Payment Method" name="rentMethod" placeholder="e.g. Standing Order" />
                </div>
                <Input label="Refundable Deposit Amount" name="depositAmount" placeholder="e.g. £1,440" />
                <Input label="Deposit Protection Scheme" name="depositScheme" placeholder="e.g. Deposit Protection Service (DPS)" />
                <div className="p-3 bg-sky-50 border border-sky-100 rounded-xl text-xs text-sky-700">
                  Under the Tenant Fees Act 2019, deposits are capped at 5 weeks' rent (if annual rent is under £50,000).
                </div>
              </div>
            )}

            {activeStep === 4 && details.jurisdiction === 'england' && (
              <div className="space-y-4">
                <p className="text-xs text-gray-600">Select all bills and utilities that the Tenant is responsible to pay:</p>
                <div className="flex flex-wrap gap-2 pt-2">
                  {['Council Tax', 'Water', 'Gas', 'Electricity', 'Internet', 'TV Licence', 'Telephone'].map((util) => (
                    <button
                      key={util}
                      type="button"
                      onClick={() => handleUtilityToggle(util)}
                      className={cn(
                        "px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer min-w-[92px] sm:min-w-0",
                        details.utilities.includes(util)
                          ? "bg-black text-white border-black"
                          : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
                      )}
                    >
                      {util}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {activeStep === 5 && details.jurisdiction === 'england' && (
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-600 block">Landlord Repair Duties</label>
                  <textarea
                    name="landlordRepairResponsibilities"
                    value={details.landlordRepairResponsibilities}
                    onChange={handleChange}
                    placeholder="e.g. Keep structural exterior and services in high repair."
                    className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-all min-h-[90px]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-600 block">Tenant Upkeep Duties</label>
                  <textarea
                    name="tenantRepairResponsibilities"
                    value={details.tenantRepairResponsibilities}
                    onChange={handleChange}
                    placeholder="e.g. Day-to-day cleaning, maintaining keys, checking smoke alarms."
                    className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-all min-h-[90px]"
                  />
                </div>
              </div>
            )}

            {activeStep === 6 && details.jurisdiction === 'england' && (
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-600 block">Pet Policy</label>
                  <select
                    name="petAllowed"
                    value={details.petAllowed}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black"
                  >
                    <option value="no">Strictly Not Allowed</option>
                    <option value="yes">Allowed</option>
                    <option value="with_consent">Allowed only with prior written consent</option>
                  </select>
                </div>
                <Input label="Pet Rules / Conditions" name="petConditions" placeholder="e.g. Max 1 trained cat, no damage allowed" />
              </div>
            )}

            {activeStep === 7 && details.jurisdiction === 'england' && (
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-600 block">Custom Clauses & Conditions</label>
                  <textarea
                    name="otherTerms"
                    value={details.otherTerms}
                    onChange={handleChange}
                    placeholder="Enter any custom clauses (e.g., parking space rules, smoke detectors, garden care, break clauses)"
                    className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-all min-h-[120px]"
                  />
                </div>

                {/* Clause Builder Card */}
                <div className="bg-violet-50/40 border border-violet-100 rounded-2xl p-4 space-y-3 relative overflow-hidden shadow-sm">
                  <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-violet-300 via-sky-300 to-emerald-300" />
                  <div className="flex items-center gap-1.5 text-violet-800 font-bold text-xs uppercase tracking-wide">
                    <Sparkles className="w-3.5 h-3.5 text-violet-500" />
                    Clause Builder
                  </div>
                  <p className="text-[11px] text-gray-500 leading-normal">
                    Enter notes in plain English and the app will convert them into cleaner agreement wording.
                  </p>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-0.5">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Category</label>
                      <select
                        value={clauseCategory}
                        onChange={(e) => setClauseCategory(e.target.value)}
                        className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs outline-none focus:ring-1 focus:ring-violet-300"
                      >
                        <option value="Garden Care">Garden Care</option>
                        <option value="Parking Rules">Parking Rules</option>
                        <option value="Professional Cleaning">End of Tenancy Cleaning</option>
                        <option value="Break Clause">Break Clause</option>
                        <option value="Smoking/Vaping">Smoking & Vaping</option>
                        <option value="Other Custom">Other Custom</option>
                      </select>
                    </div>
                    <div className="space-y-0.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Or Select Quick Note</label>
                      <select
                        onChange={(e) => {
                          if (e.target.value) {
                            setCasualClause(e.target.value);
                            e.target.value = '';
                          }
                        }}
                        className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs outline-none focus:ring-1 focus:ring-violet-300 text-slate-500"
                      >
                        <option value="">-- Quick templates --</option>
                        <option value="Tenant must cut the grass every 2 weeks in summer.">Mow grass fortnightly</option>
                        <option value="No cars parked on the lawn, only in the designated single bay.">Parking restrictions</option>
                        <option value="Carpets must be cleaned professionally if tenant had a pet.">Pet carpet clean</option>
                        <option value="Either party can end contract after 6 months with 2 months notice.">6-month break clause</option>
                        <option value="Strictly no smoking or vaping inside the property.">No smoking inside</option>
                      </select>
                    </div>
                  </div>

                  <textarea
                    value={casualClause}
                    onChange={(e) => setCasualClause(e.target.value)}
                    placeholder="Describe your rule (e.g. tenant must not paint the walls without permission)..."
                    className="w-full min-h-[60px] px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-violet-200 focus:border-violet-400 transition-all resize-y"
                  />

                  <button
                    type="button"
                    onClick={handleDraftClause}
                    disabled={isDraftingClause || !casualClause.trim()}
                        className="w-full bg-slate-900 hover:bg-violet-700 text-white disabled:bg-gray-100 disabled:text-gray-400 disabled:border-gray-200 py-1.5 px-3 rounded-lg text-xs font-bold transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    {isDraftingClause ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        DRAFTING LEGAL TERM...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5 text-violet-400" />
                        DRAFT CLAUSE
                      </>
                    )}
                  </button>

                  {draftingError && (
                    <div className="text-[11px] text-red-600 font-medium">{draftingError}</div>
                  )}

                  <AnimatePresence>
                    {draftedClause && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-white border border-violet-200 rounded-lg p-3 space-y-2 mt-2"
                      >
                    <div className="text-[10px] font-bold text-violet-700 uppercase tracking-wider">Drafted Clause:</div>
                        <p className="text-xs italic text-gray-700 leading-normal bg-gray-50 p-2.5 rounded border border-gray-100">
                          {draftedClause}
                        </p>
                        <button
                          type="button"
                          onClick={handleAppendClause}
                          className="w-full bg-violet-600 hover:bg-violet-700 text-white py-1.5 px-3 rounded-lg text-xs font-bold transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-1"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          APPEND TO CUSTOM CLAUSES
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="p-4 bg-emerald-50/80 border border-emerald-100 rounded-2xl space-y-2 shadow-sm">
                  <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs uppercase tracking-wider">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Agreement Ready!
                  </div>
                  <p className="text-xs text-emerald-700 leading-normal">
                    Review the document preview on the right, copy its text or print/download directly as a signature-ready draft.
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Stepper Navigation Footer */}
      <div className="p-5 md:p-6 border-t border-black/5 bg-gradient-to-t from-white to-slate-50/70 flex items-center justify-between">
        <button
          onClick={prevStep}
          disabled={activeStep === 0}
          className={cn(
            "flex items-center gap-1.5 px-4 py-2 border rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer select-none",
            activeStep === 0 
              ? "border-slate-200 text-slate-300 bg-slate-50 cursor-not-allowed" 
              : "border-slate-300 text-slate-700 hover:bg-slate-50 font-sans"
          )}
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </button>

        <span className="text-xs font-semibold text-slate-400 font-mono">
          {activeStep + 1} / {steps.length}
        </span>

        {activeStep === steps.length - 1 ? (
          <div className="flex items-center gap-1 bg-emerald-600 text-white px-4 py-2 rounded-xl text-xs font-bold select-none cursor-default shadow-sm font-sans">
            Ready ✓
          </div>
        ) : (
          <button
            onClick={nextStep}
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 text-white hover:bg-slate-800 rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer select-none shadow-sm font-sans"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
