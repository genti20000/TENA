import React from 'react';
import { TenancyDetails } from '../types';
import { Sparkles } from 'lucide-react';

interface AgreementDocProps {
  details: TenancyDetails;
  isExplainerMode?: boolean;
  onSectionClick?: (sectionTitle: string, sectionText: string) => void;
  onSignClick?: (party: 'landlord' | 'tenant') => void;
}

export const AgreementDoc = React.forwardRef<HTMLDivElement, AgreementDocProps>(
  ({ details, isExplainerMode = false, onSectionClick, onSignClick }, ref) => {
    
    // Theme selectors
    const getThemeClasses = () => {
      switch (details.documentTheme) {
        case 'parchment':
          return 'bg-[#FAF6EE] text-[#2C251E] font-serif border-[#E6DCC8] shadow-md';
        case 'minimalist':
          return 'bg-white text-gray-900 font-sans border-gray-100 shadow-sm';
        case 'charcoal':
          return 'bg-white text-slate-900 font-serif border-slate-300 shadow-lg';
        default:
          return 'bg-white text-gray-900 font-serif border-gray-100';
      }
    };

    const getHeaderThemeClasses = () => {
      switch (details.documentTheme) {
        case 'parchment':
          return 'text-2xl font-bold uppercase tracking-wider mb-2 text-[#4A3C31] border-b-2 border-double border-[#4A3C31] pb-2';
        case 'minimalist':
          return 'text-2xl font-black uppercase tracking-widest mb-1 font-sans text-black';
        case 'charcoal':
          return 'text-3xl font-bold uppercase tracking-normal mb-2 text-[#0F172A] border-b-4 border-[#0F172A] pb-2';
        default:
          return 'text-2xl font-bold uppercase tracking-widest mb-2';
      }
    };

    const getSectionHeaderClasses = () => {
      switch (details.documentTheme) {
        case 'parchment':
          return 'text-base font-bold border-b border-[#2C251E] mb-3 pb-1 text-[#4A3C31] uppercase tracking-wide';
        case 'minimalist':
          return 'text-xs font-bold uppercase tracking-widest font-sans text-gray-400 mb-3 block border-l-2 border-black pl-2';
        case 'charcoal':
          return 'bg-[#0F172A] text-white px-4 py-1.5 font-sans font-bold text-xs uppercase tracking-wider mb-3 rounded-sm shadow-sm';
        default:
          return 'text-lg font-bold border-b border-black mb-3 pb-1';
      }
    };

    // Helper component to render interactive section boxes
    const DocSection = ({
      title,
      textForAi,
      children,
    }: {
      title: string;
      textForAi: string;
      children: React.ReactNode;
    }) => {
      const handleClick = () => {
        if (isExplainerMode && onSectionClick) {
          onSectionClick(title, textForAi);
        }
      };

      return (
        <section
          onClick={handleClick}
          className={`mb-8 transition-all duration-300 rounded-xl ${
            isExplainerMode
              ? 'cursor-pointer hover:bg-violet-50/70 hover:ring-2 hover:ring-violet-400 hover:shadow-md p-4 -m-4 relative group'
              : ''
          }`}
        >
          {isExplainerMode && (
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-violet-600 text-white p-1 rounded-lg shadow-sm flex items-center gap-1 text-[9px] font-bold uppercase pointer-events-none select-none z-10 animate-bounce">
              <Sparkles className="w-3 h-3 text-violet-200" />
              Explain Clause
            </div>
          )}
          <h2 className={getSectionHeaderClasses()}>{title}</h2>
          <div className={`${details.documentTheme === 'minimalist' ? 'text-sm text-gray-700 leading-relaxed' : 'text-[11pt] leading-relaxed'}`}>
            {children}
          </div>
        </section>
      );
    };

    return (
      <div
        ref={ref}
        className={`p-6 sm:p-8 md:p-14 lg:p-18 min-h-[1100px] max-w-[850px] mx-auto border transition-all duration-500 relative rounded-3xl ${getThemeClasses()}`}
        id="tenancy-agreement"
      >
        {/* Document Header */}
        <div className="text-center mb-10 sm:mb-12">
          <h1 className={`${getHeaderThemeClasses()} text-[1.6rem] sm:text-2xl`}>
            Assured Periodic Tenancy Agreement
          </h1>
          <p className="text-[10px] sm:text-xs italic text-gray-500 uppercase tracking-widest font-sans">
            Residential Property in England
          </p>
        </div>

        {/* Section 1: Parties */}
        <DocSection
          title="1. THE PARTIES"
          textForAi={`This section defines the legal names and service addresses of the landlord and the tenant. Under UK law, the landlord must provide an address in England or Wales where legal notices can be served on them (Section 48 of the Landlord and Tenant Act 1987). Current Landlord: ${details.landlordName || '[Landlord Name]'} (Address: ${details.landlordAddress || '[Landlord Address]'}), and Tenant: ${details.tenantName || '[Tenant Name]'}.`}
        >
          <div className="space-y-3 font-sans text-xs">
            <p>
              <strong>The Landlord:</strong> {details.landlordName || '[Landlord Name]'}
            </p>
            <p>
              <strong>Landlord's Contact Address:</strong> {details.landlordAddress || "[Landlord's Address]"}
            </p>
            <p>
              <strong>The Tenant:</strong> {details.tenantName || '[Tenant Name]'}
            </p>
          </div>
        </DocSection>

        {/* Section 2: Property */}
        <DocSection
          title="2. THE PROPERTY"
          textForAi={`This section specifies the physical boundaries and details of the property being let. The Landlord lets and the Tenant takes the property at: ${details.propertyAddress || '[Full Property Address]'}. Description: ${details.propertyDescription || '[Property Description]'}.`}
        >
          <p>
            The Landlord lets and the Tenant takes the residential premises at:
          </p>
          <p className="mt-2 font-semibold">
            {details.propertyAddress || '[Full Property Address]'}
          </p>
          {details.propertyDescription && (
            <p className="mt-2 text-sm text-gray-500 italic font-sans leading-relaxed">
              Description: {details.propertyDescription}
            </p>
          )}
        </DocSection>

        {/* Section 3: Term */}
        <DocSection
          title="3. THE TERM"
          textForAi={`This section sets out the assured periodic tenancy and its start date. The agreement starts on ${details.startDate || '[Start Date]'} and continues on a rolling periodic basis rather than ending on a fixed date.`}
        >
          <p>
            This agreement is an assured periodic tenancy starting on{" "}
            <strong>{details.startDate || '[Start Date]'}</strong> and continuing on a{" "}
            <strong>{details.period || 'monthly'}</strong> periodic basis.
          </p>
        </DocSection>

        {/* Section 4: Rent */}
        <DocSection
          title="4. THE RENT"
          textForAi={`This section describes the rent payment details. Rent is ${details.rentAmount || '[Rent Amount]'} per ${details.rentFrequency}. Payments must be made in advance. The first payment is due on ${details.startDate || 'the start date'}, and subsequent payments are due on the ${details.rentDueDate || '[Due Date]'} of each ${details.rentFrequency === 'monthly' ? 'month' : 'week'}. Paid via ${details.rentMethod || '[Payment Method]'}.`}
        >
          <p>
            The rent is <strong>{details.rentAmount || '[Rent Amount]'}</strong> per{" "}
            {details.rentFrequency}.
          </p>
          <ul className="list-disc ml-6 mt-2 space-y-1 text-sm font-sans">
            <li>Payable in advance.</li>
            <li>First payment due on {details.startDate || 'the start date'}.</li>
            <li>Subsequent payments due on the {details.rentDueDate || '[Due Date]'} of each {details.rentFrequency === 'monthly' ? 'month' : 'week'}.</li>
            <li>Payment method: {details.rentMethod || '[Payment Method]'}.</li>
          </ul>
        </DocSection>

        {/* Section 5: Deposit */}
        <DocSection
          title="5. THE DEPOSIT"
          textForAi={`This section specifies the security deposit details: ${details.depositAmount || '[Deposit Amount]'} protected in a scheme: ${details.depositScheme || '[Scheme]'}. Under the Tenant Fees Act 2019, deposits for properties in England with an annual rent under £50,000 are legally capped at exactly 5 weeks' rent. The landlord must protect the deposit in a government-authorised tenancy deposit protection scheme within 30 days of receiving it.`}
        >
          <p>
            A security deposit of <strong>{details.depositAmount || '[Deposit Amount]'}</strong> shall be paid by the Tenant to the Landlord on or before signing this Agreement.
          </p>
          <p className="mt-2">
            The Landlord shall protect the deposit in a government-authorised tenancy deposit protection scheme:{" "}
            <strong>{details.depositScheme || '[Scheme Details]'}</strong>.
          </p>
          <p className="mt-2 text-xs text-gray-500 font-sans">
            Deductions may be legally made from the deposit at the end of the tenancy only for:
          </p>
          <ul className="list-disc ml-6 text-xs text-gray-500 font-sans space-y-1 mt-1">
            <li>Damage to the Property or its contents (allowing for fair wear and tear).</li>
            <li>Unpaid rent or utility bills.</li>
            <li>Cleaning costs if the Property is not returned in the same professional condition as at the start of the tenancy.</li>
          </ul>
        </DocSection>

        {/* Section 6: Bills and Utilities */}
        <DocSection
          title="6. BILLS AND UTILITIES"
          textForAi={`This section defines the utility billing responsibilities. The Tenant agrees to pay for the selected utilities linked to the Property: ${details.utilities.join(', ') || 'None selected'}. Under the Tenant Fees Act, utilities are permitted payments that landlords can require tenants to pay.`}
        >
          <p>The Tenant agrees to pay for the following utilities and services linked to the Property during the tenancy:</p>
          {details.utilities.length > 0 ? (
            <div className="grid grid-cols-2 gap-2 mt-2 font-sans text-xs">
              {details.utilities.map((util) => (
                <div key={util} className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-900" />
                  <span>{util}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-400 italic font-sans mt-2">No utilities selected. Tenant is responsible for all standard household bills unless specified otherwise.</p>
          )}
        </DocSection>

        {/* Section 7: Repair and Maintenance */}
        <DocSection
          title="7. REPAIR AND MAINTENANCE"
          textForAi={`This section details the repair duties. Under Section 11 of the Landlord and Tenant Act 1985, the landlord is legally responsible to keep the structure and exterior of the property in repair, and keep working installations for water, gas, electricity, sanitation, heating, and hot water. The tenant is responsible for minor maintenance 'in a tenant-like manner' (e.g. changing light bulbs, cleaning, and reporting issues).`}
        >
          <div className="space-y-4 text-xs font-sans">
            <div>
              <h3 className="font-bold underline text-slate-800">Landlord's Responsibilities:</h3>
              <p className="text-gray-600 mt-1 leading-relaxed">
                {details.landlordRepairResponsibilities || "To keep in repair the structure and exterior of the Property and keep in repair and proper working order the installations in the Property for the supply of water, gas and electricity and for sanitation (including basins, sinks, baths and sanitary conveniences). [Section 11, Landlord and Tenant Act 1985]"}
              </p>
            </div>
            <div>
              <h3 className="font-bold underline text-slate-800">Tenant's Responsibilities:</h3>
              <p className="text-gray-600 mt-1 leading-relaxed">
                {details.tenantRepairResponsibilities || "To take reasonable care of the Property, its decorations, furniture, fixtures and fittings and to report any repairs needed to the Landlord as soon as possible. The Tenant is responsible for day-to-day upkeep such as changing light bulbs, unblocking domestic drains, and keeping ventilation clear."}
              </p>
            </div>
          </div>
        </DocSection>

        {/* Section 8: Use of Property */}
        <DocSection
          title="8. USE OF PROPERTY"
          textForAi="This section sets guidelines for how the tenant can use the property. It must only be used as a private residential residence, and business use, sub-letting or taking lodgers should only happen with written consent where lawful."
        >
          <ul className="list-disc ml-6 space-y-1 text-sm font-sans text-gray-700">
            <li>The Property is to be used as a private residential residence only.</li>
            <li>No business use is permitted without the Landlord's prior written consent.</li>
            <li>Sub-letting or taking in lodgers is strictly prohibited.</li>
            <li>No illegal or immoral activities are permitted on the premises.</li>
          </ul>
        </DocSection>

        {/* Section 9: Alterations */}
        <DocSection
          title="9. ALTERATIONS"
          textForAi="This section prohibits the tenant from making any major modifications, structural changes, or redecorating (such as painting walls or changing light fixtures) without the landlord's prior written permission."
        >
          <p className="text-sm">
            The Tenant must not make any alterations, additions or redecorate the Property without the Landlord's prior written consent.
          </p>
        </DocSection>

        {/* Section 10: Pets */}
        <DocSection
          title="10. PETS"
          textForAi={`This section specifies the pet policy: ${details.petAllowed === 'yes' ? 'Allowed' : details.petAllowed === 'with_consent' ? 'Allowed only with prior written consent' : 'Strictly not allowed'}. Conditions: ${details.petConditions || 'None'}. Under standard UK agreements, landlords must not unreasonably refuse pet requests, but can require tenants to sign a pet agreement to prevent damage.`}
        >
          <p className="text-sm">
            {details.petAllowed === 'yes' 
              ? "Pets are permitted at the Property, subject to reasonable conditions." 
              : details.petAllowed === 'with_consent' 
              ? "Pets are permitted only with the Landlord's prior written consent, which will not be unreasonably withheld where the law requires." 
              : "Pet requests will be considered in accordance with applicable law and any consent may be subject to reasonable conditions."}
            {details.petConditions && ` Conditions: ${details.petConditions}`}
          </p>
        </DocSection>

        {/* Section 11: Ending the Tenancy */}
        <DocSection
          title="11. ENDING THE TENANCY"
          textForAi="This section details notice periods for an assured periodic tenancy. The tenant may end the tenancy by giving written notice in accordance with the rent period and applicable law. The landlord may only seek possession using the correct statutory grounds and prescribed forms in force at the time."
        >
          <div className="text-xs font-sans space-y-2">
            <p>
              <strong>Tenant's Notice:</strong> The Tenant may end the tenancy by giving written notice in accordance with the applicable law and the rent period stated in this Agreement.
            </p>
            <p>
              <strong>Landlord's Notice:</strong> The Landlord may only seek possession of the Property in accordance with the Housing Act 1988 as amended, using the applicable statutory grounds and prescribed notice forms in force at the time.
            </p>
          </div>
        </DocSection>

        {/* Section 12: Inventory */}
        <DocSection
          title="12. INVENTORY"
          textForAi="This section highlights that an inventory and schedule of condition is attached to record the property's state before move-in. This is vital legal proof for both parties in case of deposit disputes."
        >
          <p className="text-sm italic">
            An Inventory and Schedule of Condition shall be attached to this Agreement and signed by both parties to record the state of the Property and its contents at the commencement of the tenancy.
          </p>
        </DocSection>

        {/* Section 13: Governing Law */}
        <DocSection
          title="13. GOVERNING LAW"
          textForAi="This tenancy agreement is governed by the law of England."
        >
          <p className="text-sm">
            This agreement is governed by the laws of England.
          </p>
        </DocSection>

        {/* Custom Terms section */}
        {details.otherTerms && (
          <DocSection
            title="14. ADDITIONAL TERMS"
            textForAi={`This section contains custom clauses added by the landlord: "${details.otherTerms}". Any custom clause must not be an 'unfair term' under the Consumer Rights Act 2015, which means it must not create a significant imbalance in rights or duties to the detriment of the tenant.`}
          >
            <p className="text-sm font-sans preserve-whitespace whitespace-pre-wrap leading-relaxed text-gray-700 bg-gray-50/40 p-4 rounded-xl border border-gray-200/50">
              {details.otherTerms}
            </p>
          </DocSection>
        )}

        {/* Signatures block */}
        <section className="mt-16 pt-8 border-t border-slate-200 font-sans">
          <h2 className="text-base font-bold uppercase tracking-wider mb-8 text-gray-900">Signatures & Execution</h2>
          <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mb-6 leading-relaxed">
            By signing below, the parties confirm they have read, understood, and agree to be bound by the terms of this Assured Periodic Tenancy Agreement.
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 sm:gap-12">
            {/* Landlord signature block */}
            <div className="space-y-6">
              <h3 className="font-bold text-xs uppercase tracking-wider text-indigo-900 border-b border-indigo-50 pb-1">Landlord</h3>
              
              <div className="space-y-2">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Digital Signature</p>
                {details.landlordSignature ? (
                  <div
                    onClick={() => onSignClick?.('landlord')}
                    className="h-16 w-full flex items-center justify-center bg-white/90 rounded-xl border border-gray-200 hover:border-violet-500 hover:ring-2 hover:ring-violet-200 p-2 relative group cursor-pointer transition-all shadow-sm"
                    title="Click to sign again"
                  >
                    <img src={details.landlordSignature} alt="Landlord Signature" className="max-h-full object-contain mix-blend-multiply" />
                    <div className="absolute inset-0 bg-violet-950/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-xl">
                      <span className="bg-white/90 text-violet-700 border border-violet-100 px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest shadow-sm">
                        Re-Sign
                      </span>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => onSignClick?.('landlord')}
                    className="h-16 w-full border-2 border-dashed border-gray-300 hover:border-black bg-gray-50/50 hover:bg-white text-gray-400 hover:text-black font-semibold text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 uppercase tracking-wider shadow-2xs hover:shadow-sm"
                  >
                    Sign Digitally
                  </button>
                )}
              </div>

              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Full Name (Print)</p>
                <p className="font-bold border-b border-gray-100 text-xs py-1 min-h-[22px]">{details.landlordName || '[Landlord Name]'}</p>
              </div>

              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Date Signed</p>
                <div className="border-b border-gray-200 text-xs py-1 min-h-[22px]">
                  {details.landlordSignature ? new Date().toLocaleDateString('en-GB') : '[Date]'}
                </div>
              </div>
            </div>

            {/* Tenant signature block */}
            <div className="space-y-6">
              <h3 className="font-bold text-xs uppercase tracking-wider text-indigo-900 border-b border-indigo-50 pb-1">Tenant</h3>
              
              <div className="space-y-2">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Digital Signature</p>
                {details.tenantSignature ? (
                  <div
                    onClick={() => onSignClick?.('tenant')}
                    className="h-16 w-full flex items-center justify-center bg-white/90 rounded-xl border border-gray-200 hover:border-violet-500 hover:ring-2 hover:ring-violet-200 p-2 relative group cursor-pointer transition-all shadow-sm"
                    title="Click to sign again"
                  >
                    <img src={details.tenantSignature} alt="Tenant Signature" className="max-h-full object-contain mix-blend-multiply" />
                    <div className="absolute inset-0 bg-violet-950/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-xl">
                      <span className="bg-white/90 text-violet-700 border border-violet-100 px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest shadow-sm">
                        Re-Sign
                      </span>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => onSignClick?.('tenant')}
                    className="h-16 w-full border-2 border-dashed border-gray-300 hover:border-black bg-gray-50/50 hover:bg-white text-gray-400 hover:text-black font-semibold text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 uppercase tracking-wider shadow-2xs hover:shadow-sm"
                  >
                    Sign Digitally
                  </button>
                )}
              </div>

              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Full Name (Print)</p>
                <p className="font-bold border-b border-gray-100 text-xs py-1 min-h-[22px]">{details.tenantName || '[Tenant Name]'}</p>
              </div>

              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Date Signed</p>
                <div className="border-b border-gray-200 text-xs py-1 min-h-[22px]">
                  {details.tenantSignature ? new Date().toLocaleDateString('en-GB') : '[Date]'}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer advisory note */}
        <div className="mt-10 sm:mt-12 text-[9pt] text-gray-400 italic border-t border-gray-100/50 pt-4 font-sans text-center">
          <p>This tool creates tenancy document templates only. It is not legal advice. Users should have the final document reviewed by a qualified solicitor or housing professional before signing. The app does not guarantee enforceability.</p>
        </div>
      </div>
    );
  }
);

AgreementDoc.displayName = 'AgreementDoc';
