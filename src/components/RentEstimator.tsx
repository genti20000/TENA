import React, { useState } from 'react';
import { TenancyDetails, RentEstimation } from '../types';
import { aiEstimateRent } from '../lib/gemini';
import { Sparkles, Loader2, Info, CheckSquare, Square, PoundSterling, ShieldAlert, Award } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface RentEstimatorProps {
  details: TenancyDetails;
  onChange: (details: TenancyDetails) => void;
}

export const RentEstimator: React.FC<RentEstimatorProps> = ({ details, onChange }) => {
  const [loading, setLoading] = useState(false);
  const [estimation, setEstimation] = useState<RentEstimation | null>(null);
  const [error, setError] = useState('');
  
  // Interactive compliance checklist items checked state
  const [checkedTips, setCheckedTips] = useState<Record<number, boolean>>({});

  const handleEstimate = async () => {
    const address = details.propertyAddress;
    const description = details.propertyDescription;

    if (!address || address === '[Property Address]') {
      setError('Please provide a property address before running the market estimate.');
      return;
    }

    setLoading(true);
    setError('');
    setCheckedTips({});
    try {
      const result = await aiEstimateRent(address, description);
      setEstimation(result);
      
      // If an average estimate is successfully retrieved and there's no rent amount currently set,
      // offer to apply the average rent estimate to the rent amount!
      // (But don't overwrite if they already have one set, or ask them via button click)
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to generate rent valuation.');
    } finally {
      setLoading(false);
    }
  };

  const toggleTip = (idx: number) => {
    setCheckedTips((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  const applyEstimatedRent = (amount: string) => {
    // Strip non-digit characters to keep it a clean number formatting
    const numericOnly = amount.replace(/[^0-9]/g, '');
    if (numericOnly) {
      onChange({
        ...details,
        rentAmount: `£${numericOnly}`,
      });
    }
  };

  return (
    <div className="bg-gradient-to-br from-indigo-50/40 via-violet-50/20 to-white border border-indigo-100 rounded-2xl p-5 space-y-4 relative overflow-hidden shadow-sm">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-500 via-indigo-500 to-purple-500" />
      
      {/* Title block */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-indigo-50 text-indigo-700 rounded-lg">
            <Sparkles className="w-4 h-4 animate-pulse" />
          </div>
          <div>
        <h4 className="text-xs font-bold text-indigo-950 uppercase tracking-wider">Valuation & Safety Compliance</h4>
            <p className="text-[10px] text-gray-500 leading-none mt-0.5">UK Regional Intelligence & Checklists</p>
          </div>
        </div>
      </div>

      <p className="text-xs text-gray-600 leading-relaxed font-sans">
      Analyze your property address and description to get a rough local market valuation and a practical safety compliance checklist.
      </p>

      {error && (
        <div className="bg-red-50 border border-red-100 text-red-700 text-xs p-3 rounded-lg flex gap-2">
          <ShieldAlert className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <p className="font-semibold">{error}</p>
        </div>
      )}

      {/* Trigger Button */}
      <button
        type="button"
        onClick={handleEstimate}
        disabled={loading}
        className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-100 disabled:text-gray-400 disabled:border-gray-200 text-white font-bold py-2 px-4 rounded-xl text-xs transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 shadow-sm"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            QUERYING UK MARKET AVERAGES...
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4 text-indigo-200" />
            RUN MARKET ANALYSIS
          </>
        )}
      </button>

            {/* Estimations Output */}
      <AnimatePresence>
        {estimation && !loading && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-4 pt-3 border-t border-indigo-50"
          >
            {/* Price Estimator Gauge */}
            <div className="bg-white border border-indigo-100/50 rounded-xl p-4 shadow-2xs space-y-3">
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">
                Estimated Monthly Rent (PCM)
              </div>
              
              <div className="grid grid-cols-3 gap-2 text-center items-center py-1">
                <div className="bg-gray-50 border border-gray-100 p-2 rounded-lg">
                  <div className="text-[9px] font-bold text-gray-400 uppercase">Low</div>
                  <div className="text-sm font-bold text-gray-700 mt-0.5">{estimation.lowEstimate}</div>
                </div>
                
                <div className="bg-indigo-50/70 border border-indigo-100 p-2.5 rounded-xl scale-105 shadow-2xs ring-1 ring-indigo-200/50 relative overflow-hidden">
                  <div className="absolute top-0 inset-x-0 h-0.5 bg-indigo-500" />
                  <div className="text-[9px] font-bold text-indigo-700 uppercase">Average</div>
                  <div className="text-base font-serif font-black italic text-indigo-950 mt-0.5">{estimation.averageEstimate}</div>
                </div>
                
                <div className="bg-gray-50 border border-gray-100 p-2 rounded-lg">
                  <div className="text-[9px] font-bold text-gray-400 uppercase">High</div>
                  <div className="text-sm font-bold text-gray-700 mt-0.5">{estimation.highEstimate}</div>
                </div>
              </div>

              {/* Offer to apply Average Rent */}
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={() => applyEstimatedRent(estimation.averageEstimate)}
                  className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 transition-colors uppercase tracking-wider flex items-center gap-1 bg-indigo-50/30 hover:bg-indigo-50 py-1.5 px-3 rounded-lg border border-indigo-100 cursor-pointer"
                >
                  <PoundSterling className="w-3.5 h-3.5" />
                  Apply Average Rent to Draft
                </button>
              </div>
            </div>

            {/* Location insights */}
            <div className="p-3.5 bg-white border border-gray-100 rounded-xl space-y-1.5 font-sans">
              <span className="text-[9px] font-bold text-indigo-700 uppercase tracking-wider block">Local Market Insight</span>
              <p className="text-xs text-gray-600 leading-normal">{estimation.locationInsight}</p>
            </div>

            {/* Safety Compliance checklists */}
            <div className="space-y-2.5">
              <div className="flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-indigo-700" />
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  Legal Compliance checklist
                </span>
              </div>
              
              <div className="space-y-1.5">
                {estimation.complianceTips.map((tip, idx) => {
                  const isChecked = !!checkedTips[idx];
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => toggleTip(idx)}
                      className={`w-full text-left p-3 rounded-xl border transition-all flex items-start gap-3 cursor-pointer ${
                        isChecked
                          ? 'bg-green-50/50 border-green-200 text-green-800'
                          : 'bg-white border-gray-200/70 text-gray-700 hover:border-indigo-300'
                      }`}
                    >
                      <div className="mt-0.5 flex-shrink-0">
                        {isChecked ? (
                          <CheckSquare className="w-4 h-4 text-green-600" />
                        ) : (
                          <Square className="w-4 h-4 text-gray-400" />
                        )}
                      </div>
                      <p className="text-xs leading-normal font-sans font-medium">{tip}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
