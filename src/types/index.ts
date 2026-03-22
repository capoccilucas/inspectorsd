export type EnforcementStatus =
  | 'open'
  | 'in_progress'
  | 'enforcement_required'
  | 'closed';

export interface Inspector {
  id: string;
  name: string;
  email: string;
  phone: string;
}

export interface Order {
  id: string;
  propertyAddress: string;
  description: string;
  dateIssued: string; // ISO date string
  dueDate: string;    // ISO date string
  inspectorId: string;
  status: EnforcementStatus;
  enforcementRequired: boolean;
  notes: string;
  createdAt: string;
  updatedAt: string;
}
