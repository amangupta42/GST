// User types
export interface User {
  id: string;
  name: string;
  email: string;
  gstin?: string;
  role: 'admin' | 'user';
}

// Dashboard types
export interface DashboardKPIs {
  currentLiability: number;
  availableITC: number;
  complianceScore: number;
  pendingReturns: number;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  timestamp: Date;
  read: boolean;
}

// Return types
export interface ReturnData {
  id: string;
  type: 'GSTR1' | 'GSTR3B' | 'GSTR9';
  period: string;
  status: 'draft' | 'filed' | 'pending';
  data: Record<string, any>;
}

// Invoice types
export interface Invoice {
  id: string;
  invoiceNumber: string;
  date: Date;
  gstin: string;
  amount: number;
  taxAmount: number;
  status: 'pending' | 'matched' | 'mismatched';
}

// Reconciliation types
export interface ReconciliationMatch {
  purchaseInvoice: Invoice;
  gstr2bEntry: Invoice;
  matchScore: number;
}

export interface ReconciliationMismatch {
  purchaseInvoice?: Invoice;
  gstr2bEntry?: Invoice;
  reason: string;
}