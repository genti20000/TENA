export interface TenancyDetails {
  jurisdiction: 'england' | 'wales' | '';
  landlordName: string;
  landlordAddress: string;
  landlordEmail?: string;
  landlordPhone?: string;
  tenantName: string;
  tenantEmail?: string;
  tenantPhone?: string;
  additionalTenants?: string[];
  propertyAddress: string;
  propertyDescription: string;
  furnished?: 'furnished' | 'unfurnished' | 'part-furnished' | '';
  parkingIncluded?: boolean;
  gardenIncluded?: boolean;
  sharedAreas?: string;
  excludedAreas?: string;
  tenancyType?: 'assured periodic tenancy' | '';
  period?: 'monthly' | 'weekly' | '';
  rentDueDay: string;
  startDate: string;
  rentAmount: string;
  rentFrequency: 'monthly' | 'weekly';
  rentMethod: string;
  firstPaymentDueDate?: string;
  depositAmount: string;
  depositScheme: string;
  holdingDepositTaken?: boolean;
  advanceRentRequested?: string;
  councilTaxPayer?: 'tenant' | 'landlord' | 'included' | 'unknown' | '';
  waterPayer?: 'tenant' | 'landlord' | 'included' | 'unknown' | '';
  gasPayer?: 'tenant' | 'landlord' | 'included' | 'unknown' | '';
  electricityPayer?: 'tenant' | 'landlord' | 'included' | 'unknown' | '';
  internetPayer?: 'tenant' | 'landlord' | 'included' | 'unknown' | '';
  tvLicencePayer?: 'tenant' | 'landlord' | 'included' | 'unknown' | '';
  serviceChargesText?: string;
  includedBillsText?: string;
  utilities: string[];
  petAllowed: 'yes' | 'no' | 'with_consent';
  petsPolicy?: 'requests_considered' | 'no_pets_without_consent' | 'pets_allowed_with_conditions' | '';
  smokingPolicy?: string;
  businessUsePolicy?: string;
  sublettingPolicy?: string;
  lodgersPolicy?: string;
  alterationsPolicy?: string;
  cleaningClause?: string;
  repairsReportingContact?: string;
  emergencyContact?: string;
  petConditions: string;
  landlordRepairResponsibilities: string;
  tenantRepairResponsibilities: string;
  otherTerms: string;
  documentTheme: 'parchment' | 'minimalist' | 'charcoal';
  landlordSignature?: string;
  tenantSignature?: string;
  savedAt?: string;
}

export const defaultDetails: TenancyDetails = {
  jurisdiction: '',
  landlordName: '[Landlord Name]',
  landlordAddress: '[Landlord Address]',
  landlordEmail: '',
  landlordPhone: '',
  tenantName: '[Tenant Name]',
  tenantEmail: '',
  tenantPhone: '',
  additionalTenants: [],
  propertyAddress: '[Property Address]',
  propertyDescription: '[e.g., A three-bedroom semi-detached house with garden]',
  furnished: '',
  parkingIncluded: false,
  gardenIncluded: false,
  sharedAreas: '',
  excludedAreas: '',
  tenancyType: 'assured periodic tenancy',
  period: 'monthly',
  startDate: '[Start Date]',
  rentAmount: '[Monthly Rent]',
  rentFrequency: 'monthly',
  rentDueDay: '1st',
  rentMethod: 'Standing Order',
  firstPaymentDueDate: '',
  depositAmount: '[Deposit Amount]',
  depositScheme: '[e.g., Deposit Protection Service (DPS)]',
  holdingDepositTaken: false,
  advanceRentRequested: '',
  councilTaxPayer: 'tenant',
  waterPayer: 'tenant',
  gasPayer: 'tenant',
  electricityPayer: 'tenant',
  internetPayer: 'tenant',
  tvLicencePayer: 'tenant',
  serviceChargesText: '',
  includedBillsText: '',
  utilities: ['Council Tax', 'Water', 'Gas', 'Electricity', 'Internet'],
  petAllowed: 'no',
  petsPolicy: 'requests_considered',
  smokingPolicy: '',
  businessUsePolicy: '',
  sublettingPolicy: '',
  lodgersPolicy: '',
  alterationsPolicy: '',
  cleaningClause: '',
  repairsReportingContact: '',
  emergencyContact: '',
  petConditions: '',
  landlordRepairResponsibilities: '',
  tenantRepairResponsibilities: '',
  otherTerms: '',
  documentTheme: 'parchment',
  landlordSignature: '',
  tenantSignature: '',
  savedAt: '',
};

export interface ComplianceIssue {
  id: string;
  category: 'deposit' | 'jurisdiction' | 'unfair_term' | 'placeholder' | 'wales' | 'rent' | 'possession' | 'other';
  severity: 'error' | 'warning' | 'info';
  title: string;
  message: string;
  fixSuggestion?: string;
}

export interface ComplianceReport {
  isCompliant: boolean;
  score: number;
  issues: ComplianceIssue[];
  checkedAt: string;
}

export interface ClauseExplanation {
  explanation: string;
  landlordImpact: string;
  tenantImpact: string;
  legalAct?: string;
}

export interface RentEstimation {
  lowEstimate: string;
  highEstimate: string;
  averageEstimate: string;
  locationInsight: string;
  complianceTips: string[];
}

