import React, { useState, useRef, useEffect } from 'react';
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
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const AddressAutocompleteInput = ({ value, onChange, placeholder }: { value: string, onChange: (val: string) => void, placeholder?: string }) => {
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!value || value.length < 3 || !showSuggestions) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(value)}&countrycodes=gb&addressdetails=1`);
        const data = await res.json();
        setSuggestions(data);
      } catch (err) {
        console.error("Failed to fetch address", err);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [value, showSuggestions]);

  return (
    <div className="relative" ref={wrapperRef}>
      <input
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setShowSuggestions(true);
        }}
        onFocus={() => setShowSuggestions(true)}
        placeholder={placeholder}
        className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-all"
        autoComplete="off"
      />
      {showSuggestions && suggestions.length > 0 && (
        <ul className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {suggestions.map((item, idx) => (
            <li
              key={idx}
              className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 border-b border-gray-50 last:border-none cursor-pointer"
              onClick={() => {
                onChange(item.display_name);
                setShowSuggestions(false);
              }}
            >
              {item.display_name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

interface AgreementFormProps {
  details: TenancyDetails;
  onChange: (details: TenancyDetails) => void;
}

export const AgreementForm: React.FC<AgreementFormProps> = ({ details, onChange }) => {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    { id: 'parties', title: 'Parties', icon: User, desc: 'Landlord & tenant legal info' },
    { id: 'property', title: 'Property', icon: Home, desc: 'Address & specifications' },
    { id: 'term', title: 'Term', icon: Calendar, desc: 'Dates & tenancy length' },
    { id: 'financials', title: 'Financials', icon: PoundSterling, desc: 'Rent, deposit & protection' },
    { id: 'utilities', title: 'Utilities', icon: Zap, desc: 'Utility bill responsibility' },
    { id: 'maintenance', title: 'Maintenance', icon: Wrench, desc: 'Upkeep & repairs split' },
    { id: 'pets', title: 'Pets', icon: Dog, desc: 'Pet policy & rules' },
    { id: 'additional', title: 'Clauses', icon: MessageSquarePlus, desc: 'Custom rules & finalize' },
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    onChange({ ...details, [name]: value });
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
        return !!(details.landlordName && details.landlordName !== '[Landlord Name]' && 
                  details.tenantName && details.tenantName !== '[Tenant Name]');
      case 1:
        return !!(details.propertyAddress && details.propertyAddress !== '[Property Address]');
      case 2:
        return !!(details.startDate && details.startDate !== '[Start Date]' && 
                  details.endDate && details.endDate !== '[End Date]');
      case 3:
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
    <div className="bg-[#F9F9F7] h-full flex flex-col border-r border-gray-200">
      {/* Dynamic Stepper Header */}
      <div className="p-6 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-serif font-bold italic">Draft Assistant</h2>
            <div className="text-[10px] text-gray-400 mt-0.5 uppercase tracking-widest font-semibold flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
              UK AST Wizard
            </div>
          </div>
          <button 
            onClick={() => {
              onChange(defaultDetails);
              setActiveStep(0);
            }}
            className="text-[10px] font-bold text-gray-400 hover:text-black transition-colors uppercase tracking-widest flex items-center gap-1 cursor-pointer"
            title="Reset to default placeholders"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </button>
        </div>

        {/* Mini Step Badges / Progress Nav */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-1 no-scrollbar select-none">
          {steps.map((step, idx) => {
            const IconComponent = step.icon;
            const isActive = idx === activeStep;
            const isCompleted = isStepComplete(idx) && idx < activeStep;

            return (
              <button
                key={step.id}
                onClick={() => setActiveStep(idx)}
                className={cn(
                  "flex items-center justify-center p-2 rounded-lg transition-all relative flex-shrink-0 cursor-pointer",
                  isActive 
                    ? "bg-black text-white shadow-sm" 
                    : isCompleted 
                    ? "bg-green-50 border border-green-200 text-green-700" 
                    : "bg-gray-50 border border-gray-200 text-gray-500 hover:bg-gray-100"
                )}
                title={`${step.title}: ${step.desc}`}
              >
                <IconComponent className="w-4 h-4" />
                {isActive && (
                  <span className="ml-1.5 text-xs font-bold font-sans hidden sm:inline">
                    {step.title}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Overall Progress Bar */}
        <div className="w-full bg-gray-100 h-1.5 rounded-full mt-4 overflow-hidden">
          <motion.div 
            className="bg-black h-full rounded-full"
            initial={{ width: '0%' }}
            animate={{ width: `${((activeStep + 1) / steps.length) * 100}%` }}
            transition={{ type: 'spring', stiffness: 80, damping: 15 }}
          />
        </div>
      </div>

      {/* Step Contents Area */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="mb-6">
          <div className="flex items-center gap-2 text-gray-400 mb-1">
            <StepIcon className="w-5 h-5 text-black" />
            <span className="text-[10px] font-bold uppercase tracking-widest">
              Step {activeStep + 1} of {steps.length}
            </span>
          </div>
          <h3 className="text-lg font-serif font-bold text-gray-900 leading-tight">
            {currentStepInfo.title}
          </h3>
          <p className="text-xs text-gray-500 mt-1">
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
            className="space-y-4"
          >
            {activeStep === 0 && (
              <div className="space-y-4">
                <Input label="Landlord Legal Name" name="landlordName" placeholder="e.g. John Doe" />
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-600 block">Landlord Service Address</label>
                  <AddressAutocompleteInput
                     value={details.landlordAddress}
                     onChange={(val) => onChange({ ...details, landlordAddress: val })}
                     placeholder="Search for service address"
                  />
                </div>
                <Input label="Tenant Full Name" name="tenantName" placeholder="e.g. Jane Smith" />
                <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg text-xs text-blue-700 flex gap-2">
                  <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <p>In England & Wales, landlords must provide tenants with an address in England or Wales for serving notices.</p>
                </div>
              </div>
            )}

            {activeStep === 1 && (
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-600 block">Tenancy Property Address</label>
                  <AddressAutocompleteInput
                    value={details.propertyAddress}
                    onChange={(val) => onChange({ ...details, propertyAddress: val })}
                    placeholder="Search for address or postcode"
                  />
                </div>
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

            {activeStep === 2 && (
              <div className="space-y-4">
                <Input label="Contract/Term Length" name="termLength" placeholder="e.g. 12 months" />
                <div className="grid grid-cols-2 gap-3">
                  <Input label="Start Date" name="startDate" placeholder="DD/MM/YYYY" />
                  <Input label="End Date" name="endDate" placeholder="DD/MM/YYYY" />
                </div>
                <div className="p-3 bg-amber-50 border border-amber-100 rounded-lg text-xs text-amber-700 flex gap-2">
                  <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <p>An Assured Shorthold Tenancy (AST) typically has a minimum fixed period of 6 or 12 months.</p>
                </div>
              </div>
            )}

            {activeStep === 3 && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
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
                <div className="grid grid-cols-2 gap-3">
                  <Input label="Rent Due Date" name="rentDueDate" placeholder="e.g. 1st day" />
                  <Input label="Payment Method" name="rentMethod" placeholder="e.g. Standing Order" />
                </div>
                <Input label="Refundable Deposit Amount" name="depositAmount" placeholder="e.g. £1,440" />
                <Input label="Deposit Protection Scheme" name="depositScheme" placeholder="e.g. Deposit Protection Service (DPS)" />
                <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg text-xs text-blue-700">
                  Under the Tenant Fees Act 2019, deposits are capped at 5 weeks' rent (if annual rent is under £50,000).
                </div>
              </div>
            )}

            {activeStep === 4 && (
              <div className="space-y-4">
                <p className="text-xs text-gray-600">Select all bills and utilities that the Tenant is responsible to pay:</p>
                <div className="flex flex-wrap gap-2 pt-2">
                  {['Council Tax', 'Water', 'Gas', 'Electricity', 'Internet', 'TV Licence', 'Telephone'].map((util) => (
                    <button
                      key={util}
                      type="button"
                      onClick={() => handleUtilityToggle(util)}
                      className={cn(
                        "px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer",
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

            {activeStep === 5 && (
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

            {activeStep === 6 && (
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

            {activeStep === 7 && (
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
                <div className="p-4 bg-green-50/80 border border-green-100 rounded-xl space-y-2">
                  <div className="flex items-center gap-2 text-green-800 font-bold text-xs uppercase tracking-wider">
                    <CheckCircle2 className="w-4 h-4" />
                    Agreement Ready!
                  </div>
                  <p className="text-xs text-green-700 leading-normal">
                    You have navigated all legal setup components. Review the document preview on the right, copy its text or print/download directly as a signature-ready draft!
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Stepper Navigation Footer */}
      <div className="p-6 border-t border-gray-200 bg-white flex items-center justify-between">
        <button
          onClick={prevStep}
          disabled={activeStep === 0}
          className={cn(
            "flex items-center gap-1.5 px-4 py-2 border rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer select-none",
            activeStep === 0 
              ? "border-gray-200 text-gray-300 bg-gray-50 cursor-not-allowed" 
              : "border-gray-300 text-gray-700 hover:bg-gray-50 font-sans"
          )}
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </button>

        <span className="text-xs font-semibold text-gray-400 font-mono">
          {activeStep + 1} / {steps.length}
        </span>

        {activeStep === steps.length - 1 ? (
          <div className="flex items-center gap-1 bg-green-600 text-white px-4 py-2 rounded-xl text-xs font-bold select-none cursor-default shadow-sm font-sans">
            Ready ✓
          </div>
        ) : (
          <button
            onClick={nextStep}
            className="flex items-center gap-1.5 px-4 py-2 bg-black text-white hover:bg-gray-800 rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer select-none shadow-sm font-sans"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
