import React from 'react';
import { TenancyDetails } from '../types';

interface AgreementDocProps {
  details: TenancyDetails;
}

export const AgreementDoc = React.forwardRef<HTMLDivElement, AgreementDocProps>(
  ({ details }, ref) => {
    return (
      <div
        ref={ref}
        className="bg-white p-12 md:p-16 lg:p-24 shadow-sm min-h-[1100px] font-serif text-[12pt] leading-relaxed max-w-[850px] mx-auto border border-gray-100"
        id="tenancy-agreement"
      >
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold uppercase tracking-widest mb-2">
            Assured Shorthold Tenancy Agreement
          </h1>
          <p className="text-sm italic">
            Residential Property in England or Wales
          </p>
        </div>

        <section className="mb-8">
          <h2 className="text-xl font-bold border-b border-black mb-4 pb-1">
            1. THE PARTIES
          </h2>
          <div className="space-y-4">
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
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold border-b border-black mb-4 pb-1">
            2. THE PROPERTY
          </h2>
          <p>
            The Landlord lets and the Tenant takes the property at:
          </p>
          <p className="mt-2 font-semibold">
            {details.propertyAddress || '[Full Property Address]'}
          </p>
          <p className="mt-2 text-sm text-gray-700">
            {details.propertyDescription || '[Property Description]'}
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold border-b border-black mb-4 pb-1">
            3. THE TERM
          </h2>
          <p>
            The tenancy will be for a term of <strong>{details.termLength || '[Term Length]'}</strong> starting on{" "}
            <strong>{details.startDate || '[Start Date]'}</strong> and ending on{" "}
            <strong>{details.endDate || '[End Date]'}</strong>.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold border-b border-black mb-4 pb-1">
            4. THE RENT
          </h2>
          <p>
            The rent is <strong>{details.rentAmount || '[Rent Amount]'}</strong> per{" "}
            {details.rentFrequency}.
          </p>
          <ul className="list-disc ml-6 mt-2 space-y-1">
            <li>Payable in advance.</li>
            <li>First payment due on {details.startDate || 'the start date'}.</li>
            <li>Subsequent payments due on the {details.rentDueDate || '[Due Date]'} of each {details.rentFrequency === 'monthly' ? 'month' : 'week'}.</li>
            <li>Payment method: {details.rentMethod || '[Payment Method]'}.</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold border-b border-black mb-4 pb-1">
            5. THE DEPOSIT
          </h2>
          <p>
            A deposit of <strong>{details.depositAmount || '[Deposit Amount]'}</strong> shall be paid by the Tenant to the Landlord on or before signing this Agreement.
          </p>
          <p className="mt-2">
            The Landlord shall protect the deposit in a government-authorised tenancy deposit protection scheme:{" "}
            <strong>{details.depositScheme || '[Scheme Details]'}</strong>.
          </p>
          <p className="mt-2 text-sm">
            Deductions may be made from the deposit at the end of the tenancy for:
          </p>
          <ul className="list-disc ml-6 text-sm space-y-1 mt-1">
            <li>Damage to the Property or its contents (allowing for fair wear and tear).</li>
            <li>Unpaid rent or utility bills.</li>
            <li>Cleaning costs if the Property is not returned in the same condition as at the start.</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold border-b border-black mb-4 pb-1">
            6. BILLS AND UTILITIES
          </h2>
          <p>The Tenant agrees to pay for the following utilities and services linked to the Property:</p>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {details.utilities.map((util) => (
              <div key={util} className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-black" />
                <span>{util}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold border-b border-black mb-4 pb-1">
            7. REPAIR AND MAINTENANCE
          </h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-bold underline italic">Landlord's Responsibilities:</h3>
              <p className="text-sm">
                {details.landlordRepairResponsibilities || "To keep in repair the structure and exterior of the Property and keep in repair and proper working order the installations in the Property for the supply of water, gas and electricity and for sanitation. [Landlord Repair Responsibilities]"}
              </p>
            </div>
            <div>
              <h3 className="font-bold underline italic">Tenant's Responsibilities:</h3>
              <p className="text-sm">
                {details.tenantRepairResponsibilities || "To take reasonable care of the Property, its decorations, furniture, fixtures and fittings and to report any repairs needed to the Landlord as soon as possible. The Tenant is responsible for day-to-day upkeep such as changing light bulbs and unblocking sinks. [Tenant Repair Responsibilities]"}
              </p>
            </div>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold border-b border-black mb-4 pb-1">
            8. USE OF PROPERTY
          </h2>
          <ul className="list-disc ml-6 space-y-1 text-sm">
            <li>The Property is to be used as a private residential residence only.</li>
            <li>No business use is permitted without the Landlord's prior written consent.</li>
            <li>Sub-letting or taking in lodgers is strictly prohibited.</li>
            <li>No illegal or immoral activities are permitted on the premises.</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold border-b border-black mb-4 pb-1">
            9. ALTERATIONS
          </h2>
          <p className="text-sm">
            The Tenant must not make any alterations, additions or redecorate the Property without the Landlord's prior written consent.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold border-b border-black mb-4 pb-1">
            10. PETS
          </h2>
          <p className="text-sm">
            {details.petAllowed === 'yes' 
              ? "Pets are permitted at the Property." 
              : details.petAllowed === 'with_consent' 
              ? "Pets are permitted only with the Landlord's prior written consent." 
              : "No pets are allowed at the Property."}
            {details.petConditions && ` ${details.petConditions}`}
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold border-b border-black mb-4 pb-1">
            11. ENDING THE TENANCY
          </h2>
          <div className="text-sm space-y-2">
            <p>
              <strong>Tenant's Notice:</strong> The Tenant may end the tenancy after the fixed term by giving at least 1 month's written notice.
            </p>
            <p>
              <strong>Landlord's Notice:</strong> The Landlord may end the tenancy after the fixed term by giving at least 2 months' written notice (Section 21 notice).
            </p>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold border-b border-black mb-4 pb-1">
            12. INVENTORY
          </h2>
          <p className="text-sm italic">
            An Inventory and Schedule of Condition shall be attached to this Agreement and signed by both parties to record the state of the Property and its contents at the commencement of the tenancy.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold border-b border-black mb-4 pb-1">
            13. GOVERNING LAW
          </h2>
          <p className="text-sm">
            This agreement is governed by the laws of England and Wales.
          </p>
        </section>

        {details.otherTerms && (
          <section className="mb-8 p-4 bg-gray-50 border border-gray-200">
            <h2 className="text-xl font-bold border-b border-black mb-4 pb-1">
              14. ADDITIONAL TERMS
            </h2>
            <p className="text-sm preserve-whitespace whitespace-pre-wrap">
              {details.otherTerms}
            </p>
          </section>
        )}

        <section className="mt-16 pt-8 border-t border-gray-200">
          <h2 className="text-xl font-bold uppercase mb-8">Signatures</h2>
          <div className="grid grid-cols-2 gap-0">
            <div className="space-y-8 pr-12 border-r border-gray-200">
              <h3 className="font-bold text-sm uppercase tracking-wider mb-4 text-gray-400">Landlord</h3>
              <div>
                <p className="mb-2 text-sm">Signed:</p>
                <div className="border-b border-black h-12 w-full" />
              </div>
              <div>
                <p className="mb-1 text-sm">Full Name (Print):</p>
                <p className="font-bold border-b border-gray-100 min-h-[24px] py-1">{details.landlordName}</p>
              </div>
              <div>
                <p className="mb-2 text-sm">Date:</p>
                <div className="border-b border-black h-8 w-2/3" />
              </div>
            </div>

            <div className="space-y-8 pl-12">
              <h3 className="font-bold text-sm uppercase tracking-wider mb-4 text-gray-400">Tenant</h3>
              <div>
                <p className="mb-2 text-sm">Signed:</p>
                <div className="border-b border-black h-12 w-full" />
              </div>
              <div>
                <p className="mb-1 text-sm">Full Name (Print):</p>
                <p className="font-bold border-b border-gray-100 min-h-[24px] py-1">{details.tenantName}</p>
              </div>
              <div>
                <p className="mb-2 text-sm">Date:</p>
                <div className="border-b border-black h-8 w-2/3" />
              </div>
            </div>
          </div>
        </section>

        <div className="mt-12 text-[10pt] text-gray-400 italic">
          <p>Note: This is a draft agreement. Parties are advised to seek professional legal review before signing.</p>
        </div>
      </div>
    );
  }
);

AgreementDoc.displayName = 'AgreementDoc';
