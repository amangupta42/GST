import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

// Types
export interface DashboardKPI {
  currentLiability: number;
  availableITC: number;
  complianceScore: number;
  pendingReturns: number;
}

export interface ChartData {
  gstLiability: Array<{ month: string; liability: number; paid: number }>;
  itcUtilization: Array<{ month: string; available: number; utilized: number }>;
  complianceBreakdown: Array<{ name: string; value: number; color: string }>;
  filingStatus: Array<{ month: string; gstr1: number; gstr3b: number; gstr9: number }>;
}

export interface NotificationItem {
  id: string;
  type: 'warning' | 'info' | 'success';
  title: string;
  subtitle: string;
  timestamp: string;
}

interface DashboardState {
  kpis: DashboardKPI;
  chartData: ChartData;
  notifications: NotificationItem[];
  loading: boolean;
  error: string | null;
  lastUpdated: string | null;
}

// Initial state with mock data
const initialState: DashboardState = {
  kpis: {
    currentLiability: 125000,
    availableITC: 45000,
    complianceScore: 92,
    pendingReturns: 2,
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
      type: 'warning',
      title: 'GSTR-3B filing due in 5 days',
      subtitle: 'December 2024 return',
      timestamp: new Date().toISOString(),
    },
    {
      id: '2',
      type: 'info',
      title: 'New GSTR-2A data available',
      subtitle: '3 invoices to reconcile',
      timestamp: new Date().toISOString(),
    },
    {
      id: '3',
      type: 'success',
      title: 'GSTR-1 filed successfully',
      subtitle: 'November 2024 return',
      timestamp: new Date().toISOString(),
    }
  ],
  loading: false,
  error: null,
  lastUpdated: null,
};

// Async thunks for API calls
export const fetchDashboardData = createAsyncThunk(
  'dashboard/fetchDashboardData',
  async (_, { rejectWithValue }) => {
    try {
      // Import mockApi dynamically to avoid import cycle
      const { mockApi } = await import('@/lib/api');
      const response = await mockApi.getDashboardData();
      
      return {
        kpis: response.data.kpis,
        chartData: response.data.chartData,
        notifications: response.data.notifications,
      };
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch dashboard data');
    }
  }
);

export const updateKPIs = createAsyncThunk(
  'dashboard/updateKPIs',
  async (kpis: Partial<DashboardKPI>, { rejectWithValue }) => {
    try {
      const { mockApi } = await import('@/lib/api');
      const response = await mockApi.updateKPIs(kpis);
      return response.data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to update KPIs');
    }
  }
);

export const addNotification = createAsyncThunk(
  'dashboard/addNotification',
  async (notification: Omit<NotificationItem, 'id' | 'timestamp'>, { rejectWithValue }) => {
    try {
      const { mockApi } = await import('@/lib/api');
      const response = await mockApi.addNotification(notification);
      return response.data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to add notification');
    }
  }
);

export const removeNotificationAsync = createAsyncThunk(
  'dashboard/removeNotificationAsync',
  async (notificationId: string, { rejectWithValue }) => {
    try {
      const { mockApi } = await import('@/lib/api');
      await mockApi.removeNotification(notificationId);
      return notificationId;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to remove notification');
    }
  }
);

// Create slice
const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    addNotificationLocal: (state, action: PayloadAction<Omit<NotificationItem, 'id'>>) => {
      const notification: NotificationItem = {
        ...action.payload,
        id: Date.now().toString(),
      };
      state.notifications.unshift(notification);
      // Keep only the latest 10 notifications
      if (state.notifications.length > 10) {
        state.notifications = state.notifications.slice(0, 10);
      }
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(
        (notification) => notification.id !== action.payload
      );
    },
    updateChartData: (state, action: PayloadAction<Partial<ChartData>>) => {
      state.chartData = { ...state.chartData, ...action.payload };
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch dashboard data
      .addCase(fetchDashboardData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboardData.fulfilled, (state, action) => {
        state.loading = false;
        state.kpis = action.payload.kpis;
        state.chartData = action.payload.chartData;
        state.notifications = action.payload.notifications;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(fetchDashboardData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update KPIs
      .addCase(updateKPIs.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateKPIs.fulfilled, (state, action) => {
        state.loading = false;
        state.kpis = { ...state.kpis, ...action.payload };
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(updateKPIs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Add notification
      .addCase(addNotification.pending, (state) => {
        state.loading = true;
      })
      .addCase(addNotification.fulfilled, (state, action) => {
        state.loading = false;
        state.notifications.unshift(action.payload);
        // Keep only the latest 10 notifications
        if (state.notifications.length > 10) {
          state.notifications = state.notifications.slice(0, 10);
        }
      })
      .addCase(addNotification.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Remove notification
      .addCase(removeNotificationAsync.fulfilled, (state, action) => {
        state.notifications = state.notifications.filter(n => n.id !== action.payload);
      })
      .addCase(removeNotificationAsync.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

// Export actions
export const {
  setLoading,
  clearError,
  addNotificationLocal,
  removeNotification,
  updateChartData,
} = dashboardSlice.actions;

// Export selectors
export const selectDashboardKPIs = (state: { dashboard: DashboardState }) => state.dashboard.kpis;
export const selectChartData = (state: { dashboard: DashboardState }) => state.dashboard.chartData;
export const selectNotifications = (state: { dashboard: DashboardState }) => state.dashboard.notifications;
export const selectDashboardLoading = (state: { dashboard: DashboardState }) => state.dashboard.loading;
export const selectDashboardError = (state: { dashboard: DashboardState }) => state.dashboard.error;

export default dashboardSlice.reducer;