// GST rates as per 2025 reforms
export const GST_RATES = {
  EXEMPT: 0,
  LOW: 5,
  STANDARD: 18,
  HIGH: 40,
} as const;

// Return types
export const RETURN_TYPES = {
  GSTR1: 'GSTR-1',
  GSTR3B: 'GSTR-3B',
  GSTR9: 'GSTR-9',
} as const;

// Filing deadlines (days from month end)
export const FILING_DEADLINES = {
  GSTR1: 11,
  GSTR3B: 20,
  GSTR9: 365, // Annual
} as const;

// API endpoints
export const API_ENDPOINTS = {
  AUTH: '/api/auth',
  DASHBOARD: '/api/dashboard',
  RETURNS: '/api/returns',
  RECONCILIATION: '/api/reconciliation',
  GSTN: '/api/gstn',
} as const;

// Local storage keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'gst_auth_token',
  USER_PREFERENCES: 'gst_user_preferences',
  DRAFT_DATA: 'gst_draft_data',
} as const;