export interface TenancyDetails {
  landlordName: string;
  landlordAddress: string;
  tenantName: string;
  propertyAddress: string;
  propertyDescription: string;
  termLength: string;
  startDate: string;
  endDate: string;
  rentAmount: string;
  rentFrequency: 'monthly' | 'weekly';
  rentDueDate: string;
  rentMethod: string;
  depositAmount: string;
  depositScheme: string;
  utilities: string[];
  petAllowed: 'yes' | 'no' | 'with_consent';
  petConditions: string;
  landlordRepairResponsibilities: string;
  tenantRepairResponsibilities: string;
  otherTerms: string;
}

export const defaultDetails: TenancyDetails = {
  landlordName: '[Landlord Name]',
  landlordAddress: '[Landlord Address]',
  tenantName: '[Tenant Name]',
  propertyAddress: '[Property Address]',
  propertyDescription: '[e.g., A three-bedroom semi-detached house with garden]',
  termLength: '12 months',
  startDate: '[Start Date]',
  endDate: '[End Date]',
  rentAmount: '[Monthly Rent]',
  rentFrequency: 'monthly',
  rentDueDate: '1st',
  rentMethod: 'Standing Order',
  depositAmount: '[Deposit Amount]',
  depositScheme: '[e.g., Deposit Protection Service (DPS)]',
  utilities: ['Council Tax', 'Water', 'Gas', 'Electricity', 'Internet'],
  petAllowed: 'no',
  petConditions: '',
  landlordRepairResponsibilities: '',
  tenantRepairResponsibilities: '',
  otherTerms: '',
};
