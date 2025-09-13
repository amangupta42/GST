// Mock API responses for GST Compliance Dashboard

export interface APIResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  timestamp: string;
}

export interface DashboardAPIData {
  kpis: {
    currentLiability: number;
    availableITC: number;
    complianceScore: number;
    pendingReturns: number;
    liabilityTrend: number; // percentage change
    itcTrend: number; // percentage change
  };
  chartData: {
    gstLiability: Array<{ month: string; liability: number; paid: number }>;
    itcUtilization: Array<{ month: string; available: number; utilized: number }>;
    complianceBreakdown: Array<{ name: string; value: number; color: string }>;
    filingStatus: Array<{ month: string; gstr1: number; gstr3b: number; gstr9: number }>;
  };
  notifications: Array<{
    id: string;
    type: 'warning' | 'info' | 'success';
    title: string;
    subtitle: string;
    timestamp: string;
  }>;
}

// Simulate different business scenarios
export const mockScenarios = {
  // Default scenario - good compliance
  default: {
    kpis: {
      currentLiability: 125000,
      availableITC: 45000,
      complianceScore: 92,
      pendingReturns: 2,
      liabilityTrend: -12, // 12% decrease
      itcTrend: 8, // 8% increase
    },
    chartData: {
      gstLiability: [
        { month: 'Jul', liability: 98000, paid: 98000 },
        { month: 'Aug', liability: 110000, paid: 110000 },
        { month: 'Sep', liability: 102000, paid: 102000 },
        { month: 'Oct', liability: 135000, paid: 135000 },
        { month: 'Nov', liability: 128000, paid: 128000 },
        { month: 'Dec', liability: 125000, paid: 0 },
      ],
      itcUtilization: [
        { month: 'Jul', available: 48000, utilized: 45000 },
        { month: 'Aug', available: 52000, utilized: 49000 },
        { month: 'Sep', available: 46000, utilized: 44000 },
        { month: 'Oct', available: 58000, utilized: 55000 },
        { month: 'Nov', available: 50000, utilized: 47000 },
        { month: 'Dec', available: 45000, utilized: 38000 },
      ],
      complianceBreakdown: [
        { name: 'On Time Filings', value: 85, color: '#16a34a' },
        { name: 'Late Filings', value: 10, color: '#f59e0b' },
        { name: 'Missed Filings', value: 5, color: '#ef4444' }
      ],
      filingStatus: [
        { month: 'Jan', gstr1: 1, gstr3b: 1, gstr9: 0 },
        { month: 'Feb', gstr1: 1, gstr3b: 1, gstr9: 0 },
        { month: 'Mar', gstr1: 1, gstr3b: 1, gstr9: 1 },
        { month: 'Apr', gstr1: 1, gstr3b: 1, gstr9: 0 },
        { month: 'May', gstr1: 1, gstr3b: 1, gstr9: 0 },
        { month: 'Jun', gstr1: 1, gstr3b: 1, gstr9: 0 },
        { month: 'Jul', gstr1: 1, gstr3b: 1, gstr9: 0 },
        { month: 'Aug', gstr1: 1, gstr3b: 1, gstr9: 0 },
        { month: 'Sep', gstr1: 1, gstr3b: 1, gstr9: 0 },
        { month: 'Oct', gstr1: 1, gstr3b: 1, gstr9: 0 },
        { month: 'Nov', gstr1: 1, gstr3b: 1, gstr9: 0 },
        { month: 'Dec', gstr1: 0, gstr3b: 0, gstr9: 0 },
      ]
    },
    notifications: [
      {
        id: '1',
        type: 'warning' as const,
        title: 'GSTR-3B filing due in 5 days',
        subtitle: 'December 2024 return',
        timestamp: new Date().toISOString(),
      },
      {
        id: '2',
        type: 'info' as const,
        title: 'New GSTR-2A data available',
        subtitle: '3 invoices to reconcile',
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 min ago
      },
      {
        id: '3',
        type: 'success' as const,
        title: 'GSTR-1 filed successfully',
        subtitle: 'November 2024 return',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
      }
    ]
  },

  // High liability scenario
  highLiability: {
    kpis: {
      currentLiability: 285000,
      availableITC: 65000,
      complianceScore: 78,
      pendingReturns: 4,
      liabilityTrend: 25, // 25% increase
      itcTrend: -5, // 5% decrease
    },
    chartData: {
      gstLiability: [
        { month: 'Jul', liability: 180000, paid: 180000 },
        { month: 'Aug', liability: 210000, paid: 210000 },
        { month: 'Sep', liability: 195000, paid: 190000 },
        { month: 'Oct', liability: 245000, paid: 240000 },
        { month: 'Nov', liability: 268000, paid: 250000 },
        { month: 'Dec', liability: 285000, paid: 0 },
      ],
      itcUtilization: [
        { month: 'Jul', available: 68000, utilized: 65000 },
        { month: 'Aug', available: 72000, utilized: 69000 },
        { month: 'Sep', available: 66000, utilized: 62000 },
        { month: 'Oct', available: 78000, utilized: 75000 },
        { month: 'Nov', available: 70000, utilized: 67000 },
        { month: 'Dec', available: 65000, utilized: 58000 },
      ],
      complianceBreakdown: [
        { name: 'On Time Filings', value: 70, color: '#16a34a' },
        { name: 'Late Filings', value: 22, color: '#f59e0b' },
        { name: 'Missed Filings', value: 8, color: '#ef4444' }
      ],
      filingStatus: [
        { month: 'Jan', gstr1: 1, gstr3b: 1, gstr9: 0 },
        { month: 'Feb', gstr1: 1, gstr3b: 0, gstr9: 0 },
        { month: 'Mar', gstr1: 1, gstr3b: 1, gstr9: 1 },
        { month: 'Apr', gstr1: 0, gstr3b: 1, gstr9: 0 },
        { month: 'May', gstr1: 1, gstr3b: 1, gstr9: 0 },
        { month: 'Jun', gstr1: 1, gstr3b: 0, gstr9: 0 },
        { month: 'Jul', gstr1: 1, gstr3b: 1, gstr9: 0 },
        { month: 'Aug', gstr1: 0, gstr3b: 1, gstr9: 0 },
        { month: 'Sep', gstr1: 1, gstr3b: 1, gstr9: 0 },
        { month: 'Oct', gstr1: 1, gstr3b: 0, gstr9: 0 },
        { month: 'Nov', gstr1: 0, gstr3b: 0, gstr9: 0 },
        { month: 'Dec', gstr1: 0, gstr3b: 0, gstr9: 0 },
      ]
    },
    notifications: [
      {
        id: '1',
        type: 'warning' as const,
        title: 'Multiple returns overdue',
        subtitle: 'GSTR-1, GSTR-3B pending',
        timestamp: new Date().toISOString(),
      },
      {
        id: '2',
        type: 'warning' as const,
        title: 'High GST liability detected',
        subtitle: 'Consider payment planning',
        timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
      },
      {
        id: '3',
        type: 'info' as const,
        title: 'ITC reconciliation required',
        subtitle: '12 invoices to review',
        timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
      }
    ]
  },

  // Perfect compliance scenario
  perfectCompliance: {
    kpis: {
      currentLiability: 85000,
      availableITC: 28000,
      complianceScore: 100,
      pendingReturns: 0,
      liabilityTrend: -8,
      itcTrend: 12,
    },
    chartData: {
      gstLiability: [
        { month: 'Jul', liability: 78000, paid: 78000 },
        { month: 'Aug', liability: 82000, paid: 82000 },
        { month: 'Sep', liability: 75000, paid: 75000 },
        { month: 'Oct', liability: 88000, paid: 88000 },
        { month: 'Nov', liability: 85000, paid: 85000 },
        { month: 'Dec', liability: 85000, paid: 85000 },
      ],
      itcUtilization: [
        { month: 'Jul', available: 25000, utilized: 25000 },
        { month: 'Aug', available: 28000, utilized: 28000 },
        { month: 'Sep', available: 22000, utilized: 22000 },
        { month: 'Oct', available: 30000, utilized: 30000 },
        { month: 'Nov', available: 28000, utilized: 28000 },
        { month: 'Dec', available: 28000, utilized: 28000 },
      ],
      complianceBreakdown: [
        { name: 'On Time Filings', value: 100, color: '#16a34a' },
        { name: 'Late Filings', value: 0, color: '#f59e0b' },
        { name: 'Missed Filings', value: 0, color: '#ef4444' }
      ],
      filingStatus: [
        { month: 'Jan', gstr1: 1, gstr3b: 1, gstr9: 0 },
        { month: 'Feb', gstr1: 1, gstr3b: 1, gstr9: 0 },
        { month: 'Mar', gstr1: 1, gstr3b: 1, gstr9: 1 },
        { month: 'Apr', gstr1: 1, gstr3b: 1, gstr9: 0 },
        { month: 'May', gstr1: 1, gstr3b: 1, gstr9: 0 },
        { month: 'Jun', gstr1: 1, gstr3b: 1, gstr9: 0 },
        { month: 'Jul', gstr1: 1, gstr3b: 1, gstr9: 0 },
        { month: 'Aug', gstr1: 1, gstr3b: 1, gstr9: 0 },
        { month: 'Sep', gstr1: 1, gstr3b: 1, gstr9: 0 },
        { month: 'Oct', gstr1: 1, gstr3b: 1, gstr9: 0 },
        { month: 'Nov', gstr1: 1, gstr3b: 1, gstr9: 0 },
        { month: 'Dec', gstr1: 1, gstr3b: 1, gstr9: 0 },
      ]
    },
    notifications: [
      {
        id: '1',
        type: 'success' as const,
        title: 'All returns filed on time',
        subtitle: 'Perfect compliance achieved',
        timestamp: new Date().toISOString(),
      },
      {
        id: '2',
        type: 'success' as const,
        title: 'December GSTR-3B filed',
        subtitle: 'Filed 3 days early',
        timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
      },
      {
        id: '3',
        type: 'info' as const,
        title: 'ITC fully utilized',
        subtitle: 'Optimal tax efficiency',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
      }
    ]
  }
};

export type MockScenario = keyof typeof mockScenarios;