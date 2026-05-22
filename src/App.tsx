import React, { useEffect, useState, useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { AgreementDoc } from './components/AgreementDoc';
import { AgreementForm } from './components/AgreementForm';
import { SignaturePad } from './components/SignaturePad';
import { TenancyDetails, defaultDetails, ComplianceReport, ClauseExplanation } from './types';
import { 
  Printer, 
  Copy, 
  Check, 
  Download, 
  Info, 
  AlertTriangle, 
  Sparkles, 
  Loader2, 
  CheckCircle2, 
  Palette, 
  BookOpen, 
  Scale, 
  ShieldCheck, 
  HelpCircle,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { aiCheckCompliance, aiExplainClause } from './lib/gemini';

export default function App() {
  const [details, setDetails] = useState<TenancyDetails>(defaultDetails);
  const [copied, setCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const componentRef = useRef<HTMLDivElement>(null);

  // Compliance drawer states
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isAuditing, setIsAuditing] = useState(false);
  const [report, setReport] = useState<ComplianceReport | null>(null);

  // Explainer states
  const [isExplainerMode, setIsExplainerMode] = useState(false);
  const [isExplaining, setIsExplaining] = useState(false);
  const [explanation, setExplanation] = useState<ClauseExplanation | null>(null);
  const [explainingSection, setExplainingSection] = useState<string | null>(null);

  // Signature states
  const [isSigPadOpen, setIsSigPadOpen] = useState(false);
  const [sigPadParty, setSigPadParty] = useState<'landlord' | 'tenant' | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('uk-tenancy-wizard-draft');
      if (saved) setDetails(JSON.parse(saved));
    } catch (error) {
      console.error('Failed to restore draft', error);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('uk-tenancy-wizard-draft', JSON.stringify({ ...details, savedAt: new Date().toISOString() }));
    } catch (error) {
      console.error('Failed to save draft', error);
    }
  }, [details]);

  const runComplianceCheck = async () => {
    setIsDrawerOpen(true);
    setIsAuditing(true);
    try {
      const result = await aiCheckCompliance(details);
      setReport(result);
    } catch (error) {
      console.error(error);
    } finally {
      setIsAuditing(false);
    }
  };

  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: `Tenancy_Agreement_${details.tenantName || 'Draft'}`,
  });

  const copyToClipboard = () => {
    const element = document.getElementById('tenancy-agreement');
    if (element) {
      const range = document.createRange();
      range.selectNode(element);
      window.getSelection()?.removeAllRanges();
      window.getSelection()?.addRange(range);
      document.execCommand('copy');
      window.getSelection()?.removeAllRanges();
      
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const downloadPDF = async () => {
    const element = componentRef.current;
    if (!element) return;

    setIsDownloading(true);
    try {
      // Create high resolution canvas for clean text rendering
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.95);

      // Create PDF standard container
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210; // A4 Width
      const pageHeight = 297; // A4 Height
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      // Page 1
      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Slice subsequent pages
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      const filename = `Tenancy_Agreement_${(details.tenantName || 'Draft').replace(/\s+/g, '_')}.pdf`;
      pdf.save(filename);
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  // Triggers explaining a section using the local explainer
  const handleSectionClick = async (title: string, textForAi: string) => {
    setExplainingSection(title);
    setIsExplaining(true);
    setExplanation(null);
    try {
      const result = await aiExplainClause(title, textForAi);
      setExplanation(result);
    } catch (error) {
      console.error('Failed to translate clause:', error);
    } finally {
      setIsExplaining(false);
    }
  };

  // Triggers the signature canvas popup
  const handleSignClick = (party: 'landlord' | 'tenant') => {
    setSigPadParty(party);
    setIsSigPadOpen(true);
  };

  const handleSaveSignature = (dataUrl: string) => {
    if (sigPadParty === 'landlord') {
      setDetails({ ...details, landlordSignature: dataUrl });
    } else if (sigPadParty === 'tenant') {
      setDetails({ ...details, tenantSignature: dataUrl });
    }
    setIsSigPadOpen(false);
    setSigPadParty(null);
  };

  return (
    <div className="flex flex-col min-h-screen overflow-hidden bg-transparent">
      {/* Top Navbar */}
      <nav className="bg-white/88 backdrop-blur-md border-b border-black/5 flex flex-col gap-3 px-4 py-3 md:flex-row md:items-center md:justify-between md:px-5 md:py-0 z-20 no-print shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 bg-black flex items-center justify-center rounded-xl shadow-sm shrink-0">
            <span className="text-white font-serif font-bold text-xl italic">A</span>
          </div>
          <div className="min-w-0">
            <h1 className="font-bold text-sm tracking-tight">DRAFT ASSISTANT</h1>
            <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-widest leading-none">UK TENANCY WIZARD</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 md:gap-3 w-full md:w-auto pb-1 md:pb-0">
          {/* Theme customizer */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-[11px] font-semibold text-slate-600 shrink-0 accent-fade max-w-full basis-full sm:basis-auto sm:max-w-[160px]">
            <Palette className="w-3.5 h-3.5 text-gray-400" />
            <select
              value={details.documentTheme}
              onChange={(e) => setDetails({ ...details, documentTheme: e.target.value as any })}
              className="bg-transparent border-none outline-none text-gray-700 cursor-pointer focus:ring-0 font-sans font-bold min-w-0 truncate"
            >
              <option value="parchment">Warm Parchment</option>
              <option value="minimalist">Modern Minimalist</option>
              <option value="charcoal">Executive Slate</option>
            </select>
          </div>

          {/* Explainer toggle */}
          <button
            onClick={() => setIsExplainerMode(!isExplainerMode)}
            className={`flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl border transition-all cursor-pointer select-none active:scale-95 shrink-0 basis-[calc(50%-0.25rem)] sm:basis-auto ${
              isExplainerMode
                ? 'bg-violet-600 border-violet-600 text-white shadow-sm shadow-violet-200 ring-2 ring-violet-200'
                : 'bg-white border-slate-200 hover:border-slate-400 text-slate-700'
            }`}
            title="Click clauses in the document preview to explain them in plain English"
          >
            <BookOpen className={`w-3.5 h-3.5 ${isExplainerMode ? 'text-violet-200' : 'text-gray-400'}`} />
            {isExplainerMode ? 'EXPLAINER ON' : 'EXPLAINER'}
          </button>

          <div className="hidden sm:block h-6 w-[1px] bg-gray-200" />

          <button
            onClick={runComplianceCheck}
            className="flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold bg-gradient-to-r from-violet-500 to-sky-500 hover:from-violet-600 hover:to-sky-600 text-white rounded-lg transition-all active:scale-95 cursor-pointer shadow-sm relative overflow-hidden shrink-0 basis-[calc(50%-0.25rem)] sm:basis-auto"
          >
            <Sparkles className="w-3.5 h-3.5 text-violet-200 animate-pulse" />
            RUN AUDIT
          </button>
          
          <button
            onClick={copyToClipboard}
            className="flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold bg-white border border-slate-200 hover:border-slate-400 rounded-lg transition-all active:scale-95 cursor-pointer shrink-0 basis-[calc(50%-0.25rem)] sm:basis-auto"
          >
            {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
            {copied ? 'COPIED' : 'COPY CONTENT'}
          </button>
          
          <button
            onClick={() => handlePrint()}
            className="flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold bg-white border border-slate-200 hover:border-slate-400 rounded-lg transition-all active:scale-95 cursor-pointer shrink-0 basis-[calc(50%-0.25rem)] sm:basis-auto"
          >
            <Printer className="w-4 h-4" />
            PRINT AGREEMENT
          </button>
          
          <button
            onClick={downloadPDF}
            disabled={isDownloading}
            className="flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold bg-black text-white hover:bg-gray-800 rounded-lg transition-all active:scale-95 disabled:opacity-55 disabled:cursor-not-allowed cursor-pointer shadow-sm shrink-0 basis-[calc(50%-0.25rem)] sm:basis-auto"
          >
            <Download className="w-4 h-4" />
            {isDownloading ? 'GENERATING...' : 'DOWNLOAD PDF'}
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col lg:flex-row overflow-hidden gap-3 md:gap-4 p-3 md:p-4 lg:p-5">
        {/* Left Sidebar: Form */}
        <aside className="w-full lg:w-[400px] lg:max-w-[400px] flex-shrink-0 no-print">
          <AgreementForm details={details} onChange={setDetails} />
        </aside>

        {/* Right Content: Preview */}
        <main className="flex-1 overflow-y-auto p-3 md:p-5 lg:p-8 scroll-smooth bg-white/55 backdrop-blur-sm border border-black/5 rounded-3xl shadow-[0_15px_50px_rgba(15,23,42,0.08)] relative min-h-[50vh]">
          <div className="max-w-[900px] mx-auto space-y-5 md:space-y-6">
            {/* Warning Banner */}
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex gap-3 items-start no-print shadow-sm">
              <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-amber-800 uppercase tracking-wide">Legal Disclaimer</h4>
                <p className="text-xs text-amber-700 leading-normal mt-1">
                  This tool creates tenancy document templates only. It is not legal advice. Users should have the final document reviewed by a qualified solicitor or housing professional before signing. The app does not guarantee enforceability.
                </p>
              </div>
            </div>

            {/* Explainer Guide Helper Banner */}
            {isExplainerMode && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-gradient-to-r from-violet-500 to-indigo-600 text-white p-4 rounded-xl flex gap-3 items-center no-print shadow-md"
              >
                <Sparkles className="w-6 h-6 text-violet-200 animate-pulse flex-shrink-0" />
                <div className="flex-1">
                  <h4 className="text-xs font-bold uppercase tracking-wider">Interactive Explainer Mode Enabled</h4>
                  <p className="text-xs text-violet-100 mt-0.5 leading-normal">
                    Move your mouse over the contract document below. Hover over any clause and click it to see a plain-English explanation.
                  </p>
                </div>
                <button
                  onClick={() => setIsExplainerMode(false)}
                  className="px-2.5 py-1 text-2xs font-bold bg-white/20 hover:bg-white/30 text-white rounded-lg transition-all cursor-pointer"
                >
                  DISMISS
                </button>
              </motion.div>
            )}

            {/* The Document */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="shadow-[0_16px_40px_rgba(15,23,42,0.08)] rounded-3xl overflow-hidden"
            >
              {details.jurisdiction === '' || details.jurisdiction === 'england' ? (
                <AgreementDoc 
                  ref={componentRef} 
                  details={details} 
                  isExplainerMode={isExplainerMode}
                  onSectionClick={handleSectionClick}
                  onSignClick={handleSignClick}
                />
              ) : (
                <div ref={componentRef} className="bg-white p-8 sm:p-10 rounded-3xl border border-black/5 shadow-sm min-h-[60vh]" id="tenancy-agreement">
                  <h2 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 mb-2">Wales information checklist</h2>
                  <p className="text-sm text-slate-600 mb-6">
                    Wales uses occupation contracts under Renting Homes (Wales), not the English assured periodic tenancy template.
                  </p>
                  <ul className="list-disc ml-5 space-y-2 text-sm text-slate-700">
                    <li>Confirm whether a standard or secure occupation contract is needed.</li>
                    <li>Check the written statement requirements before occupation starts.</li>
                    <li>Confirm any prescribed information, safety and licensing duties that apply.</li>
                    <li>Build a separate Welsh contract flow before exporting a formal document.</li>
                  </ul>
                </div>
              )}
            </motion.div>

            {/* Footer space */}
            <div className="h-12 md:h-16 no-print" />
          </div>
        </main>
      </div>

      {/* Signature Canvas Popup Modal */}
      <SignaturePad
        isOpen={isSigPadOpen}
        onClose={() => {
          setIsSigPadOpen(false);
          setSigPadParty(null);
        }}
        onSave={handleSaveSignature}
        title={sigPadParty === 'landlord' ? 'Landlord Signature Pad' : 'Tenant Signature Pad'}
      />

      {/* Interactive Explainer Modal */}
      <AnimatePresence>
        {(isExplaining || explanation) && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setIsExplaining(false);
                setExplanation(null);
                setExplainingSection(null);
              }}
              className="fixed inset-0 bg-black z-40 no-print"
            />
            {/* Explainer panel popup */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-[#FAFBFD] border border-gray-200 shadow-2xl rounded-2xl w-full max-w-[550px] max-h-[85vh] z-50 flex flex-col no-print overflow-hidden select-none"
            >
              {/* Header */}
              <div className="p-6 border-b border-gray-200 bg-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-violet-50 text-violet-700 rounded-lg">
                    <Sparkles className="w-4 h-4 animate-spin-slow" />
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-lg text-gray-900">Clause Explainer</h3>
                    <p className="text-[9px] text-gray-400 font-semibold uppercase tracking-widest leading-none mt-0.5">
                      UK Housing Legal Translation
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setIsExplaining(false);
                    setExplanation(null);
                    setExplainingSection(null);
                  }}
                  className="p-1 rounded-full text-gray-400 hover:text-black hover:bg-gray-50 transition-all cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {isExplaining ? (
                  <div className="h-64 flex flex-col items-center justify-center space-y-4 text-center">
                    <div className="relative">
                      <div className="w-12 h-12 rounded-full border-4 border-violet-100 border-t-violet-600 animate-spin" />
                      <Sparkles className="w-5 h-5 text-violet-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-gray-800">Translating legal wording...</h4>
                      <p className="text-xs text-gray-400 mt-1 max-w-xs leading-normal">
                        The app is preparing a plain-English summary for "{explainingSection}".
                      </p>
                    </div>
                  </div>
                ) : explanation ? (
                  <div className="space-y-5 font-sans">
                    {/* Badge legislation */}
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        Clause: {explainingSection}
                      </span>
                      {explanation.legalAct && (
                        <div className="flex items-center gap-1 px-2.5 py-0.5 bg-indigo-50 border border-indigo-100 text-indigo-800 text-[10px] font-bold rounded-full uppercase tracking-wider">
                          <Scale className="w-3 h-3 text-indigo-600" />
                          {explanation.legalAct}
                        </div>
                      )}
                    </div>

                    {/* Explaining Summary card */}
                    <div className="bg-white border border-gray-150 rounded-xl p-5 shadow-2xs space-y-2 relative overflow-hidden">
                      <div className="absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r from-violet-500 to-indigo-500" />
                      <h4 className="text-[10px] font-bold text-violet-700 uppercase tracking-widest">What this means in plain English</h4>
                      <p className="text-xs text-gray-700 leading-relaxed font-normal">
                        {explanation.explanation}
                      </p>
                    </div>

                    {/* Impact split */}
                    <div className="grid grid-cols-2 gap-4">
                      {/* Landlord Impact card */}
                      <div className="bg-blue-50/30 border border-blue-100/50 rounded-xl p-4 space-y-1.5">
                        <span className="text-[9px] font-black text-blue-800 uppercase tracking-widest block">Landlord Rights & Duties</span>
                        <p className="text-2xs text-gray-650 leading-relaxed">{explanation.landlordImpact}</p>
                      </div>

                      {/* Tenant Impact card */}
                      <div className="bg-emerald-50/30 border border-emerald-100/50 rounded-xl p-4 space-y-1.5">
                        <span className="text-[9px] font-black text-emerald-800 uppercase tracking-widest block">Tenant Rights & Duties</span>
                        <p className="text-2xs text-gray-650 leading-relaxed">{explanation.tenantImpact}</p>
                      </div>
                    </div>

                    {/* Legislation footer tip */}
                    <div className="bg-slate-50 border border-slate-100 p-3 rounded-lg text-2xs leading-normal flex gap-2">
                      <ShieldCheck className="w-4 h-4 text-slate-700 flex-shrink-0 mt-0.5" />
                      <p className="text-gray-500 font-medium leading-relaxed">
                        This summary translates contract legalese to save time. It adheres to UK consumer protection guidelines ensuring transparency.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="h-32 flex flex-col items-center justify-center text-center">
                    <HelpCircle className="w-8 h-8 text-gray-300" />
                    <p className="text-xs text-gray-400 mt-2 font-medium">Select a section in explainer mode to begin.</p>
                  </div>
                )}
              </div>

              {/* Actions Footer */}
              <div className="p-4 border-t border-gray-200 bg-white flex items-center justify-end">
                <button
                  onClick={() => {
                    setIsExplaining(false);
                    setExplanation(null);
                    setExplainingSection(null);
                  }}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
                >
                  Got It
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Compliance Drawer */}
      <AnimatePresence>
        {isDrawerOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDrawerOpen(false)}
              className="fixed inset-0 bg-black z-40 no-print"
            />
            {/* Drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-[450px] bg-[#FDFDFB] border-l border-gray-200 shadow-2xl z-50 flex flex-col no-print"
            >
              {/* Header */}
              <div className="p-6 border-b border-gray-200 bg-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-violet-50 text-violet-600 rounded-lg">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-lg italic">Tenancy Compliance Report</h3>
                    <p className="text-[9px] text-gray-400 font-semibold uppercase tracking-widest leading-none text-left">England tenancy template audit</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsDrawerOpen(false)}
                  className="text-gray-400 hover:text-black transition-colors text-xs font-bold uppercase tracking-wider cursor-pointer"
                >
                  Close
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {isAuditing ? (
                  <div className="h-64 flex flex-col items-center justify-center space-y-4 text-center">
                    <div className="relative">
                      <div className="w-12 h-12 rounded-full border-4 border-violet-100 border-t-violet-600 animate-spin" />
                      <Sparkles className="w-5 h-5 text-violet-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-gray-800">Auditing Contract Details</h4>
                      <p className="text-xs text-gray-400 mt-1 leading-normal max-w-xs">
                        Reviewing jurisdiction, deposit protection, and current template wording...
                      </p>
                    </div>
                  </div>
                ) : report ? (
                  <>
                    {/* Quality Score Meter */}
                    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm text-center flex flex-col items-center relative overflow-hidden">
                      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-500 to-indigo-500" />
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Compliance Health</span>
                      <div className="mt-3 flex items-baseline justify-center gap-1">
                        <span className={`text-5xl font-serif font-bold italic ${
                          report.score >= 90 ? 'text-green-600' : report.score >= 70 ? 'text-amber-600' : 'text-red-600'
                        }`}>
                          {report.score}
                        </span>
                        <span className="text-gray-400 font-bold text-sm">/ 100</span>
                      </div>
                      
                      <div className="mt-4 flex items-center justify-center gap-2">
                        {report.isCompliant ? (
                          <div className="flex items-center gap-1 px-3 py-1 bg-green-50 border border-green-200 text-green-700 text-xs font-bold rounded-full">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            FULLY COMPLIANT
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 px-3 py-1 bg-red-50 border border-red-200 text-red-700 text-xs font-bold rounded-full">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            CRITICAL ISSUES FOUND
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Issues List */}
                    <div className="space-y-4">
                      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider text-left">Audit Findings ({report.issues.length})</h4>
                      
                      {report.issues.length === 0 ? (
                        <div className="p-8 text-center bg-green-50/50 border border-green-100 rounded-xl space-y-2">
                          <CheckCircle2 className="w-8 h-8 text-green-500 mx-auto" />
                          <h5 className="text-xs font-bold text-green-800">Perfect Score!</h5>
                          <p className="text-xs text-green-700 leading-normal">
                            We found no compliance issues or placeholders. This draft is legally sound and ready for review!
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {report.issues.map((issue) => {
                            const isError = issue.severity === 'error';
                            const isWarning = issue.severity === 'warning';
                            
                            return (
                              <div
                                key={issue.id}
                                className={`border rounded-xl p-4 space-y-2.5 shadow-sm transition-all text-left ${
                                  isError 
                                    ? 'bg-red-50/50 border-red-100' 
                                    : isWarning 
                                    ? 'bg-amber-50/50 border-amber-100' 
                                    : 'bg-blue-50/40 border-blue-100'
                                }`}
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex gap-2 items-start">
                                    <div className={`p-1 rounded-lg mt-0.5 ${
                                      isError 
                                        ? 'bg-red-100 text-red-700' 
                                        : isWarning 
                                        ? 'bg-amber-100 text-amber-700' 
                                        : 'bg-blue-100 text-blue-700'
                                    }`}>
                                      {isError ? (
                                        <AlertTriangle className="w-3.5 h-3.5" />
                                      ) : isWarning ? (
                                        <AlertTriangle className="w-3.5 h-3.5" />
                                      ) : (
                                        <Info className="w-3.5 h-3.5" />
                                      )}
                                    </div>
                                    <div>
                                      <h5 className={`text-xs font-bold uppercase tracking-wide leading-tight ${
                                        isError ? 'text-red-955' : isWarning ? 'text-amber-955' : 'text-blue-955'
                                      }`}>
                                        {issue.title}
                                      </h5>
                                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full mt-1.5 inline-block uppercase tracking-wider ${
                                        isError 
                                          ? 'bg-red-200 text-red-800' 
                                          : isWarning 
                                          ? 'bg-amber-200 text-amber-800' 
                                          : 'bg-blue-200 text-blue-800'
                                      }`}>
                                        {issue.severity}
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                <p className="text-xs text-gray-600 leading-normal font-sans">
                                  {issue.message}
                                </p>

                                {issue.fixSuggestion && (
                                  <div className="bg-white border border-gray-100 p-2.5 rounded-lg text-xs leading-normal font-sans">
                                    <span className="font-bold text-gray-700 text-[10px] uppercase tracking-wider block mb-1">Recommended Action:</span>
                                    <p className="text-gray-500 font-medium">{issue.fixSuggestion}</p>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="h-64 flex flex-col items-center justify-center space-y-4 text-center">
                    <Sparkles className="w-8 h-8 text-violet-300 animate-pulse" />
                    <div>
                      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">No Audit Performed Yet</h4>
                      <p className="text-xs text-gray-500 mt-1 max-w-xs leading-normal">
                        Click "Run Audit" above to perform a tenancy template review.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-gray-200 bg-white flex justify-center">
                <button
                  onClick={runComplianceCheck}
                  disabled={isAuditing}
                  className="w-full bg-[#1A1A1A] hover:bg-violet-700 text-white disabled:bg-gray-100 disabled:text-gray-400 py-2.5 px-4 rounded-xl text-xs font-bold transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <Sparkles className="w-3.5 h-3.5 text-violet-400" />
                  RE-RUN AUDIT
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
