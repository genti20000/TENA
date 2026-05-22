import { TenancyDetails, ComplianceReport, ClauseExplanation, RentEstimation } from '../types';

const currency = (value: string) => {
  const digits = value.replace(/[^0-9.]/g, '');
  const number = Number.parseFloat(digits);
  if (Number.isNaN(number)) return null;
  return number;
};

const placeholder = (value?: string) => !!value && /^\[.*\]$/.test(value.trim());

export async function aiSmartFill(prompt: string): Promise<Partial<TenancyDetails>> {
  const text = prompt.toLowerCase();
  const result: Partial<TenancyDetails> = {};

  const asMoney = (value: string) => `£${value.replace(/,/g, '')}`;
  const normalizeDate = (value: string) => value.replace(/\b(\d{1,2})(st|nd|rd|th)\b/gi, '$1').trim();

  const tenantMatch = prompt.match(/\bto\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,2})\b/);
  if (tenantMatch?.[1]) result.tenantName = tenantMatch[1].trim();

  const landlordMatch = prompt.match(/\b(?:landlord|owner)\s*(?:is|named|:)?\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,2})\b/);
  if (landlordMatch?.[1]) result.landlordName = landlordMatch[1].trim();

  const propertyMatch = prompt.match(/\b(?:at|for)\s+(.+?)(?:\s+to\s+[A-Z]|,\s*starting\b|\s+starting\b|\.|$)/i);
  if (propertyMatch?.[1]) result.propertyAddress = propertyMatch[1].trim();
  if (/\bcardiff\b|\bswansea\b|\bnewport\b|\bwrexham\b|\bwales\b/i.test(prompt)) result.jurisdiction = 'wales';
  if (/\blondon\b|\bmanchester\b|\bbirmingham\b|\bleeds\b|\bengland\b/i.test(prompt)) result.jurisdiction ||= 'england';

  const landlordAddressMatch = prompt.match(/\blandlord(?:'s)?\s+(?:service\s+)?address(?:\s+is|:)?\s+(.+?)(?:\.|,?\s+(?:tenant|to|starting)\b|$)/i);
  if (landlordAddressMatch?.[1]) result.landlordAddress = landlordAddressMatch[1].trim();

  const rentMatch =
    prompt.match(/\b(?:rent is|rent of|rent:?)\s*£?\s*([\d,]+(?:\.\d{1,2})?)/i) ||
    prompt.match(/£\s*([\d,]+(?:\.\d{1,2})?)\s*(?:per month|pcm|p\/m|monthly)/i);
  if (rentMatch?.[1]) result.rentAmount = asMoney(rentMatch[1]);

  if (/\bmonthly\b|\bpcm\b/i.test(prompt)) result.rentFrequency = 'monthly';
  if (/\bweekly\b|\bpw\b/i.test(prompt)) result.rentFrequency = 'weekly';
  if (/\bstanding order\b/i.test(prompt)) result.rentMethod = 'Standing Order';
  if (/\bdirect debit\b/i.test(prompt)) result.rentMethod = 'Direct Debit';
  if (/\bbank transfer\b/i.test(prompt)) result.rentMethod = 'Bank Transfer';

  const depositMatch = prompt.match(/\b(?:deposit is|deposit of|deposit:?)\s*£?\s*([\d,]+(?:\.\d{1,2})?)/i);
  if (depositMatch?.[1]) result.depositAmount = asMoney(depositMatch[1]);
  if (/\bDPS\b|\bdeposit protection service\b/i.test(prompt)) result.depositScheme = 'Deposit Protection Service (DPS)';
  else if (/\bTDS\b/i.test(prompt)) result.depositScheme = 'Tenancy Deposit Scheme (TDS)';
  else if (/\bmydeposits\b/i.test(prompt)) result.depositScheme = 'mydeposits';

  const startDateMatch = prompt.match(/\bstarting\s+([^,.]+?)(?:\s+for\b|\.|,|$)/i);
  if (startDateMatch?.[1]) result.startDate = normalizeDate(startDateMatch[1]);
  const endDateMatch = prompt.match(/\bending\s+([^,.]+?)(?:\.|,|$)/i);
  if (endDateMatch?.[1]) result.endDate = normalizeDate(endDateMatch[1]);
  const termMatch = prompt.match(/\bfor\s+(6|12|18|24)\s+months?\b/i);
  if (termMatch?.[1]) result.termLength = `${termMatch[1]} months`;
  if (/\bcontinuous\b|\bperiodic\b/i.test(prompt)) result.termLength = 'continuous';

  if (/\bno pets\b|\bno pet\b/i.test(prompt)) result.petAllowed = 'no';
  else if (/\bpet friendly\b|\bpets allowed\b|\bpet(s)? permitted\b/i.test(prompt)) result.petAllowed = 'yes';
  else if (/\bprior (written )?consent\b|\bwith consent\b/i.test(prompt)) result.petAllowed = 'with_consent';
  const petConditionMatch = prompt.match(/\bprovided it is\s+(.+?)(?:\.|$)/i) || prompt.match(/\bconditions?:\s*(.+?)(?:\.|$)/i);
  if (petConditionMatch?.[1]) result.petConditions = petConditionMatch[1].trim();

  const utilityPairs: Array<[RegExp, string]> = [
    [/\bcouncil tax\b/i, 'Council Tax'],
    [/\bwater\b/i, 'Water'],
    [/\bgas\b/i, 'Gas'],
    [/\belectricity\b/i, 'Electricity'],
    [/\binternet\b/i, 'Internet'],
    [/\btv licence\b/i, 'TV Licence'],
    [/\btelephone\b/i, 'Telephone'],
  ];
  const utilities = utilityPairs.filter(([re]) => re.test(prompt)).map(([, label]) => label);
  if (utilities.length) result.utilities = utilities;

  const landlordResp = prompt.match(/\blandlord pays\s+(.+?)(?:\.|$)/i);
  if (landlordResp?.[1]) result.landlordRepairResponsibilities = landlordResp[1].trim();
  const tenantResp = prompt.match(/\btenant pays\s+(.+?)(?:\.|$)/i);
  if (tenantResp?.[1]) result.tenantRepairResponsibilities = tenantResp[1].trim();

  const descMatch = prompt.match(/\b(?:renting|letting)\s+(?:a|an|the)?\s*(.+?)(?:\s+at\s+|\s+to\s+|$)/i);
  if (descMatch?.[1]) result.propertyDescription = descMatch[1].trim();

  return result;
}

export async function aiDraftClause(casualDescription: string, category: string): Promise<string> {
  const clean = casualDescription.trim().replace(/\s+/g, ' ');
  return `${category}: The Tenant shall ${clean.replace(/^\w/, (c) => c.toLowerCase())}.`;
}

export async function aiCheckCompliance(details: TenancyDetails): Promise<ComplianceReport> {
  const issues: ComplianceReport['issues'] = [];
  let score = 100;

  if (!details.jurisdiction) {
    issues.push({
      id: 'jurisdiction-missing',
      category: 'jurisdiction',
      severity: 'error',
      title: 'Jurisdiction not selected',
      message: 'You must choose whether the property is in England or Wales before generating a document.',
      fixSuggestion: 'Select England or Wales at the start of the wizard.',
    });
    score -= 20;
  }

  if (details.jurisdiction === 'wales') {
    issues.push({
      id: 'wales-template',
      category: 'wales',
      severity: 'error',
      title: 'Wales requires occupation contracts',
      message: 'Wales uses occupation contracts under Renting Homes (Wales), not an English assured periodic tenancy template.',
      fixSuggestion: 'Use the Wales checklist only or build a separate Welsh occupation contract module.',
    });
    score -= 30;
  }

  const rent = currency(details.rentAmount);
  const deposit = currency(details.depositAmount);
  const weeklyRent = rent
    ? details.rentFrequency === 'weekly'
      ? rent
      : rent * 12 / 52
    : null;

  if (weeklyRent !== null && deposit !== null && deposit > weeklyRent * 5) {
    issues.push({
      id: 'deposit-cap',
      category: 'deposit',
      severity: 'error',
      title: 'Deposit exceeds five-week cap',
      message: 'The deposit appears to be above the common five-week cap used for most private residential lettings in England.',
      fixSuggestion: 'Reduce the deposit to no more than five weeks of rent or verify whether an exception applies.',
    });
    score -= 25;
  }

  if (!details.landlordAddress || placeholder(details.landlordAddress)) {
    issues.push({
      id: 'landlord-address',
      category: 'jurisdiction',
      severity: 'warning',
      title: 'Landlord service address is incomplete',
      message: 'A service address is needed so notices can be served correctly.',
      fixSuggestion: 'Add a full landlord address in England or Wales.',
    });
    score -= 10;
  }

  if (/section 21/i.test(details.otherTerms || '')) {
    issues.push({
      id: 'section-21',
      category: 'possession',
      severity: 'error',
      title: 'Old possession wording detected',
      message: 'Wording that refers to Section 21 should not be used in the current England template.',
      fixSuggestion: 'Replace with statutory grounds wording under the Housing Act 1988 as amended.',
    });
  }
  if (/assured shorthold tenancy|ast/i.test(details.otherTerms || '')) {
    issues.push({
      id: 'ast-language',
      category: 'other',
      severity: 'warning',
      title: 'Old AST wording detected',
      message: 'The agreement should use assured periodic tenancy wording instead of AST wording.',
      fixSuggestion: 'Update the document title and tenancy type wording.',
    });
  }

  const fields = Object.entries(details);
  const placeholders = fields.filter(([key, value]) => typeof value === 'string' && placeholder(value) && key !== 'documentTheme');
  if (placeholders.length > 0) {
    issues.push({
      id: 'placeholders',
      category: 'placeholder',
      severity: 'info',
      title: 'Placeholder values remain',
      message: `The following fields still contain placeholders: ${placeholders.map(([key]) => key).join(', ')}.`,
      fixSuggestion: 'Replace placeholders with real tenancy details before signing.',
    });
    score -= 5;
  }

  if (details.otherTerms && /professional cleaning|penalt|fee|charge/i.test(details.otherTerms)) {
    issues.push({
      id: 'unfair-terms',
      category: 'unfair_term',
      severity: 'warning',
      title: 'Custom terms may need review',
      message: 'Some custom wording could be interpreted as an unfair or overly broad term.',
      fixSuggestion: 'Review the custom clause for fairness and clarity before use.',
    });
    score -= 10;
  }

  if (details.depositAmount && (!details.depositScheme || /not yet selected/i.test(details.depositScheme))) {
    issues.push({
      id: 'deposit-scheme',
      category: 'deposit',
      severity: 'warning',
      title: 'Deposit scheme not selected',
      message: 'A deposit amount is entered but no authorised scheme has been selected.',
      fixSuggestion: 'Select DPS, MyDeposits or Tenancy Deposit Scheme before exporting.',
    });
  }

  return {
    isCompliant: !issues.some((issue) => issue.severity === 'error'),
    score: Math.max(0, score),
    issues,
    checkedAt: new Date().toISOString(),
  };
}

export async function aiExplainClause(clauseTitle: string, clauseText: string): Promise<ClauseExplanation> {
  const title = clauseTitle.toLowerCase();
  return {
    explanation: `This section covers ${title}. It means the clause in the agreement should be read together with the full text below.`,
    landlordImpact: 'The landlord must follow the requirement stated in the clause if it is included in the agreement.',
    tenantImpact: 'The tenant should understand what is required and keep to the same rule or obligation.',
    legalAct: clauseText.toLowerCase().includes('repair') ? 'Landlord and Tenant Act 1985' : '',
  };
}

export async function aiEstimateRent(address: string, description: string): Promise<RentEstimation> {
  const bedMatch = description.match(/(\d+)\s*bed/i);
  const beds = bedMatch ? Number.parseInt(bedMatch[1], 10) : 2;
  const base = address.toLowerCase().includes('london') ? 1800 : 1100;
  const average = base + Math.max(0, beds - 2) * 250;
  return {
    lowEstimate: `£${Math.round(average * 0.9).toLocaleString('en-GB')}`,
    highEstimate: `£${Math.round(average * 1.1).toLocaleString('en-GB')}`,
    averageEstimate: `£${Math.round(average).toLocaleString('en-GB')}`,
    locationInsight: 'This is a rough local estimate based on the address and property size. Check comparable listings before setting rent.',
    complianceTips: [
      'Make sure gas safety checks are up to date where gas appliances are present.',
      'Confirm the EPC requirement is met before letting the property.',
      'Check electrical safety inspection obligations and keep records available.',
      'Install working smoke alarms on every required storey.',
    ],
  };
}
