import { mockScenarios, type MockScenario, type APIResponse, type DashboardAPIData } from './mockData';

// Simulate network delays
const simulateNetworkDelay = (min = 300, max = 800) => {
  const delay = Math.random() * (max - min) + min;
  return new Promise(resolve => setTimeout(resolve, delay));
};

// Mock API error simulation
const simulateRandomFailure = (failureRate = 0.05) => {
  return Math.random() < failureRate;
};

// Current scenario (can be changed for testing different states)
let currentScenario: MockScenario = 'default';

export const mockApi = {
  // Get dashboard data
  async getDashboardData(scenario?: MockScenario): Promise<APIResponse<DashboardAPIData>> {
    await simulateNetworkDelay(500, 1200);
    
    if (simulateRandomFailure()) {
      throw new Error('Network error: Unable to fetch dashboard data');
    }

    const scenarioData = scenario ? mockScenarios[scenario] : mockScenarios[currentScenario];
    
    return {
      data: scenarioData,
      success: true,
      message: 'Dashboard data retrieved successfully',
      timestamp: new Date().toISOString(),
    };
  },

  // Update KPIs (for testing)
  async updateKPIs(updates: Partial<DashboardAPIData['kpis']>): Promise<APIResponse<DashboardAPIData['kpis']>> {
    await simulateNetworkDelay(200, 500);
    
    if (simulateRandomFailure(0.02)) {
      throw new Error('Failed to update KPIs');
    }

    const currentData = mockScenarios[currentScenario];
    const updatedKPIs = { ...currentData.kpis, ...updates };
    
    // Update the mock data (in a real app, this would hit a backend)
    mockScenarios[currentScenario].kpis = updatedKPIs;
    
    return {
      data: updatedKPIs,
      success: true,
      message: 'KPIs updated successfully',
      timestamp: new Date().toISOString(),
    };
  },

  // Add notification
  async addNotification(notification: { title: string; subtitle: string; type: 'info' | 'warning' | 'success' }): Promise<APIResponse<DashboardAPIData['notifications'][0]>> {
    await simulateNetworkDelay(100, 300);
    
    const newNotification: DashboardAPIData['notifications'][0] = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: notification.type,
      title: notification.title,
      subtitle: notification.subtitle,
      timestamp: new Date().toISOString(),
    };
    
    (mockScenarios[currentScenario].notifications as any[]).unshift(newNotification);
    
    // Keep only the latest 20 notifications
    if (mockScenarios[currentScenario].notifications.length > 20) {
      mockScenarios[currentScenario].notifications = mockScenarios[currentScenario].notifications.slice(0, 20);
    }
    
    return {
      data: newNotification,
      success: true,
      message: 'Notification added successfully',
      timestamp: new Date().toISOString(),
    };
  },

  // Remove notification
  async removeNotification(notificationId: string): Promise<APIResponse<boolean>> {
    await simulateNetworkDelay(100, 300);
    
    const notifications = mockScenarios[currentScenario].notifications;
    const initialLength = notifications.length;
    
    mockScenarios[currentScenario].notifications = notifications.filter(n => n.id !== notificationId);
    
    const wasRemoved = mockScenarios[currentScenario].notifications.length < initialLength;
    
    return {
      data: wasRemoved,
      success: wasRemoved,
      message: wasRemoved ? 'Notification removed' : 'Notification not found',
      timestamp: new Date().toISOString(),
    };
  },

  // Get chart data (separate endpoint for efficiency)
  async getChartData(): Promise<APIResponse<DashboardAPIData['chartData']>> {
    await simulateNetworkDelay(300, 600);
    
    if (simulateRandomFailure()) {
      throw new Error('Failed to load chart data');
    }
    
    return {
      data: mockScenarios[currentScenario].chartData,
      success: true,
      message: 'Chart data retrieved successfully',
      timestamp: new Date().toISOString(),
    };
  },

  // Switch scenario (for testing different states)
  setScenario(scenario: MockScenario) {
    currentScenario = scenario;
  },

  getCurrentScenario(): MockScenario {
    return currentScenario;
  },

  // Get available scenarios
  getAvailableScenarios(): MockScenario[] {
    return Object.keys(mockScenarios) as MockScenario[];
  },

  // Health check
  async healthCheck(): Promise<APIResponse<{ status: string; uptime: number }>> {
    await simulateNetworkDelay(50, 150);
    
    return {
      data: {
        status: 'healthy',
        uptime: Date.now(),
      },
      success: true,
      message: 'API is healthy',
      timestamp: new Date().toISOString(),
    };
  }
};