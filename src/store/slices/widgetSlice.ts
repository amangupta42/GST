import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { WidgetConfig } from '@/components/ui/WidgetContainer';

interface WidgetState {
  widgets: Record<string, WidgetConfig>;
  dashboardLayout: string[]; // Array of widget IDs in order
}

const initialWidgets: Record<string, WidgetConfig> = {
  kpis: {
    id: 'kpis',
    title: 'Key Performance Indicators',
    size: 'full',
    visible: true,
    order: 0,
  },
  quickActions: {
    id: 'quickActions',
    title: 'Quick Actions',
    size: 'full',
    visible: true,
    order: 1,
  },
  gstLiabilityChart: {
    id: 'gstLiabilityChart',
    title: 'GST Liability Trend',
    size: 'medium',
    visible: true,
    order: 2,
    refreshable: true,
  },
  itcUtilizationChart: {
    id: 'itcUtilizationChart',
    title: 'ITC Utilization',
    size: 'medium',
    visible: true,
    order: 3,
    refreshable: true,
  },
  complianceChart: {
    id: 'complianceChart',
    title: 'Compliance Breakdown',
    size: 'medium',
    visible: true,
    order: 4,
    refreshable: true,
  },
  filingStatusChart: {
    id: 'filingStatusChart',
    title: 'Filing Status Timeline',
    size: 'medium',
    visible: true,
    order: 5,
    refreshable: true,
  },
  notifications: {
    id: 'notifications',
    title: 'Recent Notifications',
    size: 'full',
    visible: true,
    order: 6,
    refreshable: true,
  },
};

const initialState: WidgetState = {
  widgets: initialWidgets,
  dashboardLayout: Object.keys(initialWidgets).sort((a, b) => 
    initialWidgets[a].order - initialWidgets[b].order
  ),
};

const widgetSlice = createSlice({
  name: 'widgets',
  initialState,
  reducers: {
    toggleWidgetVisibility: (state, action: PayloadAction<{ id: string; visible: boolean }>) => {
      const { id, visible } = action.payload;
      if (state.widgets[id]) {
        state.widgets[id].visible = visible;
      }
    },

    updateWidgetSize: (state, action: PayloadAction<{ id: string; size: WidgetConfig['size'] }>) => {
      const { id, size } = action.payload;
      if (state.widgets[id]) {
        state.widgets[id].size = size;
      }
    },

    updateWidgetTitle: (state, action: PayloadAction<{ id: string; title: string }>) => {
      const { id, title } = action.payload;
      if (state.widgets[id]) {
        state.widgets[id].title = title;
      }
    },

    reorderWidgets: (state, action: PayloadAction<string[]>) => {
      const newOrder = action.payload;
      
      // Validate that all widget IDs exist
      const validIds = newOrder.filter(id => state.widgets[id]);
      
      if (validIds.length === newOrder.length) {
        state.dashboardLayout = newOrder;
        
        // Update order property for each widget
        validIds.forEach((id, index) => {
          state.widgets[id].order = index;
        });
      }
    },

    addWidget: (state, action: PayloadAction<WidgetConfig>) => {
      const widget = action.payload;
      state.widgets[widget.id] = widget;
      
      // Add to layout at the end
      if (!state.dashboardLayout.includes(widget.id)) {
        state.dashboardLayout.push(widget.id);
      }
    },

    removeWidget: (state, action: PayloadAction<string>) => {
      const widgetId = action.payload;
      delete state.widgets[widgetId];
      state.dashboardLayout = state.dashboardLayout.filter(id => id !== widgetId);
    },

    resetToDefaultLayout: (state) => {
      state.widgets = { ...initialWidgets };
      state.dashboardLayout = Object.keys(initialWidgets).sort((a, b) => 
        initialWidgets[a].order - initialWidgets[b].order
      );
    },

    hideAllWidgets: (state) => {
      Object.keys(state.widgets).forEach(id => {
        state.widgets[id].visible = false;
      });
    },

    showAllWidgets: (state) => {
      Object.keys(state.widgets).forEach(id => {
        state.widgets[id].visible = true;
      });
    },
  },
});

// Export actions
export const {
  toggleWidgetVisibility,
  updateWidgetSize,
  updateWidgetTitle,
  reorderWidgets,
  addWidget,
  removeWidget,
  resetToDefaultLayout,
  hideAllWidgets,
  showAllWidgets,
} = widgetSlice.actions;

// Selectors
export const selectAllWidgets = (state: { widgets: WidgetState }) => state.widgets.widgets;
export const selectDashboardLayout = (state: { widgets: WidgetState }) => state.widgets.dashboardLayout;
export const selectVisibleWidgets = (state: { widgets: WidgetState }) => 
  state.widgets.dashboardLayout
    .map(id => state.widgets.widgets[id])
    .filter(widget => widget && widget.visible);

export const selectWidgetById = (state: { widgets: WidgetState }, id: string) => 
  state.widgets.widgets[id];

export default widgetSlice.reducer;