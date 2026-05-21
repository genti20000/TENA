import React, { useState, useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { AgreementDoc } from './components/AgreementDoc';
import { AgreementForm } from './components/AgreementForm';
import { TenancyDetails, defaultDetails } from './types';
import { Printer, Copy, Check, Download, Info, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

export default function App() {
  const [details, setDetails] = useState<TenancyDetails>(defaultDetails);
  const [copied, setCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const componentRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: `AST_Agreement_${details.tenantName || 'Draft'}`,
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

      const filename = `AST_Agreement_${(details.tenantName || 'Draft').replace(/\s+/g, '_')}.pdf`;
      pdf.save(filename);
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#F5F5F0]">
      {/* Top Navbar */}
      <nav className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 z-10 no-print shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-black flex items-center justify-center rounded-lg">
            <span className="text-white font-serif font-bold text-xl italic">A</span>
          </div>
          <div>
            <h1 className="font-bold text-sm tracking-tight">AST DRAFTER</h1>
            <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-widest leading-none">Legal Assistant</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={copyToClipboard}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold bg-white border border-gray-200 hover:border-gray-400 rounded-lg transition-all active:scale-95 cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
            {copied ? 'COPIED' : 'COPY CONTENT'}
          </button>
          <button
            onClick={() => handlePrint()}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold bg-white border border-gray-200 hover:border-gray-400 rounded-lg transition-all active:scale-95 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            PRINT AGREEMENT
          </button>
          <button
            onClick={downloadPDF}
            disabled={isDownloading}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold bg-black text-white hover:bg-gray-800 rounded-lg transition-all active:scale-95 disabled:opacity-55 disabled:cursor-not-allowed cursor-pointer shadow-sm"
          >
            <Download className="w-4 h-4" />
            {isDownloading ? 'GENERATING...' : 'DOWNLOAD PDF'}
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar: Form */}
        <aside className="w-[400px] flex-shrink-0 no-print">
          <AgreementForm details={details} onChange={setDetails} />
        </aside>

        {/* Right Content: Preview */}
        <main className="flex-1 overflow-y-auto p-8 lg:p-12 scroll-smooth bg-gray-100">
          <div className="max-w-[900px] mx-auto space-y-8">
            {/* Warning Banner */}
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex gap-3 items-start no-print">
              <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-amber-800 uppercase tracking-wide">Legal Disclaimer</h4>
                <p className="text-xs text-amber-700 leading-normal mt-1">
                  This tool generates a template based on standard UK housing law. It does not constitute legal advice. Please have the final document reviewed by a qualified legal professional before signing. Use square brackets as placeholders if information is unknown.
                </p>
              </div>
            </div>

            {/* The Document */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <AgreementDoc ref={componentRef} details={details} />
            </motion.div>

            {/* Footer space */}
            <div className="h-24 no-print" />
          </div>
        </main>
      </div>
    </div>
  );
}
