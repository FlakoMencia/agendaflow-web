export type PreferredContactMethod = 'EMAIL' | 'SMS' | 'PHONE' | 'NONE';

export interface Customer {
  readonly id: number;
  readonly organizationId: number;
  readonly customerNumber: string | null;
  readonly firstName: string;
  readonly middleName: string | null;
  readonly lastName: string;
  readonly secondLastName: string | null;
  readonly email: string | null;
  readonly phone: string | null;
  readonly alternatePhone: string | null;
  readonly dateOfBirth: string | null;
  readonly preferredLanguage: string | null;
  readonly preferredContactMethod: PreferredContactMethod | null;
  readonly addressLine1: string | null;
  readonly addressLine2: string | null;
  readonly city: string | null;
  readonly stateCode: string | null;
  readonly postalCode: string | null;
  readonly countryCode: string | null;
  readonly emergencyContactName: string | null;
  readonly emergencyContactPhone: string | null;
  readonly emergencyContactRelationship: string | null;
  readonly emailConsent: boolean;
  readonly smsConsent: boolean;
  readonly marketingConsent: boolean;
  readonly termsAcceptedAt: string | null;
  readonly privacyPolicyAcceptedAt: string | null;
  readonly internalNotes: string | null;
  readonly active: boolean;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface CustomerRequest {
  readonly customerNumber: string | null;
  readonly firstName: string;
  readonly middleName: string | null;
  readonly lastName: string;
  readonly secondLastName: string | null;
  readonly email: string | null;
  readonly phone: string | null;
  readonly alternatePhone: string | null;
  readonly dateOfBirth: string | null;
  readonly preferredLanguage: string | null;
  readonly preferredContactMethod: PreferredContactMethod | null;
  readonly addressLine1: string | null;
  readonly addressLine2: string | null;
  readonly city: string | null;
  readonly stateCode: string | null;
  readonly postalCode: string | null;
  readonly countryCode: string | null;
  readonly emergencyContactName: string | null;
  readonly emergencyContactPhone: string | null;
  readonly emergencyContactRelationship: string | null;
  readonly emailConsent: boolean;
  readonly smsConsent: boolean;
  readonly marketingConsent: boolean;
  readonly termsAcceptedAt: string | null;
  readonly privacyPolicyAcceptedAt: string | null;
  readonly internalNotes: string | null;
  readonly active: boolean;
}

export type CreateCustomerRequest = CustomerRequest;
export type UpdateCustomerRequest = CustomerRequest;

export function customerDisplayName(
  customer: Pick<Customer, 'firstName' | 'middleName' | 'lastName' | 'secondLastName'>,
): string {
  return [customer.firstName, customer.middleName, customer.lastName, customer.secondLastName]
    .filter((part): part is string => Boolean(part))
    .join(' ');
}
