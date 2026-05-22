import React, { useState } from 'react';
import { TenancyDetails } from '../types';
import { aiSmartFill } from '../lib/gemini';
import { Sparkles, Loader2, Wand2, Info, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AiAssistanceProps {
  onFill: (details: Partial<TenancyDetails>) => void;
  currentDetails: TenancyDetails;
}

const PRESETS = [
  {
    label: "Standard Flat Share",
    short: "Standard Flat",
    text: "Renting out flat at 14 Oak Road, London (N1 2WD) to John Miller for 12 months starting 1st September 2026. Rent is £1,200 per month paid by Standing Order on the 1st of each month. Deposit is £1,380 protected in the Tenancy Deposit Scheme. Tenant pays water and Council Tax. Landlord pays Internet, electricity and gas. No pets allowed."
  },
  {
    label: "Pet-Friendly House",
    short: "Pet-Friendly",
    text: "Renting a three-bedroom house with garden at 47 High Street, Bath, BA1 5TR to Clara Oswald starting July 15th 2026 for 6 months. Rent is £1,800/month. Deposit is £2,000 in DPS. Landlord pays internet, other utilities are paid by the tenant. Prior written consent given for 1 trained dog, provided it is kept downstairs and carpets are cleaned on exit."
  }
];

export const AiAssistance: React.FC<AiAssistanceProps> = ({ onFill, currentDetails }) => {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSmartFill = async () => {
    if (!prompt.trim()) return;
    setIsLoading(true);
    setStatus('idle');
    setErrorMessage('');

    try {
      const parsedDetails = await aiSmartFill(prompt);
      
      // If we got parsed data, merge it and pass it back
      onFill(parsedDetails);
      setStatus('success');
      setTimeout(() => setStatus('idle'), 4000);
    } catch (error: any) {
      console.error('Smart Fill failed:', error);
      setStatus('error');
      setErrorMessage(error.message || 'Failed to analyze text.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm overflow-hidden relative">
      {/* Decorative Top Gradient Border */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-500 via-indigo-500 to-purple-500" />
      
      <div className="flex items-center gap-2 mb-2">
        <div className="p-1.5 bg-violet-50 text-violet-600 rounded-lg">
          <Sparkles className="w-4 h-4" />
        </div>
        <h4 className="text-sm font-bold text-gray-900 font-serif italic">Smart Fill</h4>
        <span className="text-[9px] bg-violet-100 text-violet-800 font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider">Local</span>
      </div>
      
      <p className="text-xs text-gray-500 leading-normal mb-4">
        Type or paste a brief summary of the tenancy below. The app will try to pull out the key details and fill the form automatically.
      </p>

      <div className="space-y-3">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g. John Doe renting 12 Elm St, Cardiff starting June 1st for £1200/mo. Deposit is DPS, no pets, utilities split..."
          className="w-full min-h-[90px] px-3.5 py-2.5 bg-gray-50 hover:bg-gray-100/50 focus:bg-white border border-gray-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-200 rounded-lg text-xs leading-normal transition-all outline-none resize-y"
        />

        {/* Preset Badges */}
        <div className="space-y-1">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Try a Preset Scenario:</span>
          <div className="flex gap-1.5 flex-wrap">
            {PRESETS.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setPrompt(preset.text)}
                className="text-[10px] bg-gray-100 hover:bg-violet-50 hover:text-violet-700 text-gray-600 border border-gray-200 hover:border-violet-200 px-2 py-1 rounded-md transition-all active:scale-95 cursor-pointer font-medium"
              >
                {preset.short}
              </button>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={handleSmartFill}
          disabled={isLoading || !prompt.trim()}
          className="w-full bg-[#1A1A1A] hover:bg-violet-700 text-white disabled:bg-gray-100 disabled:text-gray-400 disabled:border-gray-200 py-2 px-3 rounded-lg text-xs font-bold transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ANALYZING DESCRIPTION...
            </>
          ) : (
            <>
              <Wand2 className="w-3.5 h-3.5" />
              AUTO-FILL DETAILS
            </>
          )}
        </button>
      </div>

      {/* Notification Banner */}
      <AnimatePresence>
        {status === 'success' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="mt-3 p-2.5 bg-green-50 border border-green-200 rounded-lg text-xs text-green-800 flex gap-2 items-center"
          >
            <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
            <span>Success! Form wizard updated with locally parsed details.</span>
          </motion.div>
        )}

        {status === 'error' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="mt-3 p-2.5 bg-red-50 border border-red-200 rounded-lg text-xs text-red-800 flex gap-2 items-start"
          >
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <p className="font-bold">Smart Fill Failed</p>
              <p className="text-[11px] leading-tight text-red-700">{errorMessage}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
