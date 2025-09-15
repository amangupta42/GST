'use client';

import { useState, useCallback, useMemo } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Chip,
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TextField,
  Paper,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Menu,
  Tooltip,
  Switch,
  FormControlLabel,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Alert,
  LinearProgress,
  CircularProgress
} from '@mui/material';
import {
  Analytics as AnalyticsIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  LocationOn as LocationIcon,
  Business as BusinessIcon,
  Assessment as ReportIcon,
  Schedule as ScheduleIcon,
  Download as DownloadIcon,
  Share as ShareIcon,
  Refresh as RefreshIcon,
  FilterList as FilterIcon,
  DateRange as DateRangeIcon,
  BarChart as ChartIcon,
  PieChart as PieChartIcon,
  Timeline as TimelineIcon,
  CompareArrows as CompareIcon,
  Insights as InsightsIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, AreaChart, Area, ComposedChart } from 'recharts';

interface Location {
  id: string;
  name: string;
  gstin: string;
  address: string;
  state: string;
  type: 'headquarters' | 'branch' | 'warehouse' | 'retail';
  status: 'active' | 'inactive';
  employeeCount: number;
  monthlyTurnover: number;
  complianceScore: number;
}

interface AnalyticsData {
  locationId: string;
  locationName: string;
  period: string;
  revenue: number;
  gstLiability: number;
  itcAvailed: number;
  filingStatus: 'compliant' | 'delayed' | 'defaulted';
  transactionCount: number;
  averageTransactionValue: number;
  topCustomers: Array<{
    name: string;
    gstin: string;
    revenue: number;
    percentage: number;
  }>;
  topProducts: Array<{
    hsnCode: string;
    description: string;
    revenue: number;
    quantity: number;
    percentage: number;
  }>;
  complianceMetrics: {
    filingAccuracy: number;
    timelyFilings: number;
    penaltiesIncurred: number;
    noticesReceived: number;
  };
}

interface Report {
  id: string;
  name: string;
  type: 'monthly' | 'quarterly' | 'annual' | 'custom';
  locations: string[];
  createdAt: string;
  createdBy: string;
  status: 'generating' | 'completed' | 'failed';
  downloadUrl?: string;
  insights: Array<{
    type: 'trend' | 'anomaly' | 'recommendation';
    title: string;
    description: string;
    severity: 'low' | 'medium' | 'high';
    actionRequired: boolean;
  }>;
}

interface AdvancedAnalyticsProps {
  onNavigate?: (path: string) => void;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

export const AdvancedAnalytics = ({ onNavigate }: AdvancedAnalyticsProps) => {
  const [activeTab, setActiveTab] = useState(0);
  const [selectedLocations, setSelectedLocations] = useState<string[]>(['all']);
  const [dateRange, setDateRange] = useState('last_quarter');
  const [reportType, setReportType] = useState('comparative');
  const [locations, setLocations] = useState<Location[]>([]);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<'generate' | 'schedule' | 'insights'>('generate');

  // Mock data
  const mockLocations: Location[] = useMemo(() => [
    {
      id: 'loc-001',
      name: 'Mumbai Headquarters',
      gstin: '27AAAAA0000A1Z5',
      address: 'Mumbai, Maharashtra',
      state: 'Maharashtra',
      type: 'headquarters',
      status: 'active',
      employeeCount: 150,
      monthlyTurnover: 5000000,
      complianceScore: 95
    },
    {
      id: 'loc-002', 
      name: 'Bangalore Branch',
      gstin: '29BBBBB1111B2Y6',
      address: 'Bangalore, Karnataka',
      state: 'Karnataka',
      type: 'branch',
      status: 'active',
      employeeCount: 80,
      monthlyTurnover: 3200000,
      complianceScore: 92
    },
    {
      id: 'loc-003',
      name: 'Delhi Warehouse',
      gstin: '07CCCCC2222C3X7',
      address: 'New Delhi, Delhi',
      state: 'Delhi',
      type: 'warehouse',
      status: 'active',
      employeeCount: 45,
      monthlyTurnover: 2100000,
      complianceScore: 88
    },
    {
      id: 'loc-004',
      name: 'Pune Retail',
      gstin: '27DDDDD3333D4W8',
      address: 'Pune, Maharashtra',
      state: 'Maharashtra', 
      type: 'retail',
      status: 'active',
      employeeCount: 25,
      monthlyTurnover: 1500000,
      complianceScore: 96
    }
  ], []);

  const mockAnalyticsData: AnalyticsData[] = useMemo(() => [
    {
      locationId: 'loc-001',
      locationName: 'Mumbai HQ',
      period: '2024-Q3',
      revenue: 15000000,
      gstLiability: 2700000,
      itcAvailed: 450000,
      filingStatus: 'compliant',
      transactionCount: 1250,
      averageTransactionValue: 12000,
      topCustomers: [
        { name: 'TechCorp Ltd', gstin: '29TECHC0000T1Z1', revenue: 2500000, percentage: 16.7 },
        { name: 'Global Solutions', gstin: '07GLOBS0000G2Y2', revenue: 1800000, percentage: 12.0 }
      ],
      topProducts: [
        { hsnCode: '8471', description: 'Computer Hardware', revenue: 4500000, quantity: 350, percentage: 30.0 },
        { hsnCode: '9403', description: 'Office Furniture', revenue: 2800000, quantity: 180, percentage: 18.7 }
      ],
      complianceMetrics: {
        filingAccuracy: 98.5,
        timelyFilings: 100,
        penaltiesIncurred: 0,
        noticesReceived: 0
      }
    },
    {
      locationId: 'loc-002',
      locationName: 'Bangalore Branch',
      period: '2024-Q3',
      revenue: 9600000,
      gstLiability: 1728000,
      itcAvailed: 288000,
      filingStatus: 'compliant',
      transactionCount: 890,
      averageTransactionValue: 10787,
      topCustomers: [
        { name: 'Startup Hub', gstin: '29STRTC0000S1Z1', revenue: 1800000, percentage: 18.8 },
        { name: 'Innovation Labs', gstin: '29INNOVC0000I2Y2', revenue: 1200000, percentage: 12.5 }
      ],
      topProducts: [
        { hsnCode: '8517', description: 'Telecommunications', revenue: 3200000, quantity: 200, percentage: 33.3 },
        { hsnCode: '8471', description: 'Computer Hardware', revenue: 2400000, quantity: 150, percentage: 25.0 }
      ],
      complianceMetrics: {
        filingAccuracy: 96.2,
        timelyFilings: 95.8,
        penaltiesIncurred: 2500,
        noticesReceived: 1
      }
    }
  ], []);

  const mockReports: Report[] = useMemo(() => [
    {
      id: 'rep-001',
      name: 'Q3 2024 Multi-location Analysis',
      type: 'quarterly',
      locations: ['loc-001', 'loc-002', 'loc-003'],
      createdAt: '2024-09-01T10:00:00Z',
      createdBy: 'analytics@company.com',
      status: 'completed',
      downloadUrl: '/reports/q3-2024-analysis.pdf',
      insights: [
        {
          type: 'trend',
          title: 'Revenue Growth Acceleration',
          description: 'Mumbai HQ showing 15% QoQ growth, outperforming other locations',
          severity: 'low',
          actionRequired: false
        },
        {
          type: 'anomaly',
          title: 'Compliance Score Variation',
          description: 'Delhi warehouse showing declining compliance score - needs attention',
          severity: 'medium',
          actionRequired: true
        },
        {
          type: 'recommendation',
          title: 'ITC Optimization Opportunity',
          description: 'Bangalore branch can improve ITC utilization by 8-12%',
          severity: 'medium',
          actionRequired: true
        }
      ]
    }
  ], []);

  // Initialize mock data
  useState(() => {
    setLocations(mockLocations);
    setAnalyticsData(mockAnalyticsData);
    setReports(mockReports);
  });

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleLocationChange = (locationIds: string[]) => {
    setSelectedLocations(locationIds);
  };

  const handleGenerateReport = useCallback(() => {
    setDialogType('generate');
    setDialogOpen(true);
  }, []);

  const handleScheduleReport = useCallback(() => {
    setDialogType('schedule');
    setDialogOpen(true);
  }, []);

  const handleViewInsights = useCallback(() => {
    setDialogType('insights');
    setDialogOpen(true);
  }, []);

  const filteredAnalyticsData = useMemo(() => {
    if (selectedLocations.includes('all')) return analyticsData;
    return analyticsData.filter(data => selectedLocations.includes(data.locationId));
  }, [analyticsData, selectedLocations]);

  const aggregatedMetrics = useMemo(() => {
    const data = filteredAnalyticsData;
    if (data.length === 0) return null;

    return {
      totalRevenue: data.reduce((sum, item) => sum + item.revenue, 0),
      totalGSTLiability: data.reduce((sum, item) => sum + item.gstLiability, 0),
      totalITCAvailed: data.reduce((sum, item) => sum + item.itcAvailed, 0),
      averageCompliance: data.reduce((sum, item) => sum + item.complianceMetrics.filingAccuracy, 0) / data.length,
      totalTransactions: data.reduce((sum, item) => sum + item.transactionCount, 0)
    };
  }, [filteredAnalyticsData]);

  const renderLocationSelector = () => (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Location Analysis
        </Typography>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth>
              <InputLabel>Locations</InputLabel>
              <Select
                multiple
                value={selectedLocations}
                onChange={(e) => handleLocationChange(e.target.value as string[])}
                label="Locations"
              >
                <MenuItem value="all">All Locations</MenuItem>
                {locations.map((location) => (
                  <MenuItem key={location.id} value={location.id}>
                    {location.name} ({location.state})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Date Range</InputLabel>
              <Select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                label="Date Range"
              >
                <MenuItem value="last_month">Last Month</MenuItem>
                <MenuItem value="last_quarter">Last Quarter</MenuItem>
                <MenuItem value="last_year">Last Year</MenuItem>
                <MenuItem value="ytd">Year to Date</MenuItem>
                <MenuItem value="custom">Custom Range</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Report Type</InputLabel>
              <Select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                label="Report Type"
              >
                <MenuItem value="comparative">Comparative Analysis</MenuItem>
                <MenuItem value="trend">Trend Analysis</MenuItem>
                <MenuItem value="compliance">Compliance Report</MenuItem>
                <MenuItem value="financial">Financial Summary</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <Button
              variant="outlined"
              fullWidth
              startIcon={<RefreshIcon />}
              onClick={() => setLoading(true)}
            >
              Refresh
            </Button>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );

  const renderSummaryStats = () => {
    if (!aggregatedMetrics) return null;

    return (
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'primary.light', mr: 2 }}>
                  <TrendingUpIcon />
                </Avatar>
                <Typography variant="subtitle2" color="text.secondary">
                  Total Revenue
                </Typography>
              </Box>
              <Typography variant="h4" component="div" gutterBottom>
                ₹{(aggregatedMetrics.totalRevenue / 10000000).toFixed(1)}Cr
              </Typography>
              <Typography variant="body2" color="primary.main">
                Across {selectedLocations.includes('all') ? locations.length : selectedLocations.length} locations
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'warning.light', mr: 2 }}>
                  <ReportIcon />
                </Avatar>
                <Typography variant="subtitle2" color="text.secondary">
                  GST Liability
                </Typography>
              </Box>
              <Typography variant="h4" component="div" gutterBottom>
                ₹{(aggregatedMetrics.totalGSTLiability / 1000000).toFixed(1)}L
              </Typography>
              <Typography variant="body2" color="warning.main">
                {((aggregatedMetrics.totalGSTLiability / aggregatedMetrics.totalRevenue) * 100).toFixed(1)}% of revenue
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'success.light', mr: 2 }}>
                  <CheckCircleIcon />
                </Avatar>
                <Typography variant="subtitle2" color="text.secondary">
                  Avg Compliance
                </Typography>
              </Box>
              <Typography variant="h4" component="div" gutterBottom>
                {aggregatedMetrics.averageCompliance.toFixed(1)}%
              </Typography>
              <Typography variant="body2" color="success.main">
                Above target
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'info.light', mr: 2 }}>
                  <BusinessIcon />
                </Avatar>
                <Typography variant="subtitle2" color="text.secondary">
                  Total Transactions
                </Typography>
              </Box>
              <Typography variant="h4" component="div" gutterBottom>
                {aggregatedMetrics.totalTransactions.toLocaleString()}
              </Typography>
              <Typography variant="body2" color="info.main">
                This period
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    );
  };

  const renderLocationComparison = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={8}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Revenue Comparison by Location
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={filteredAnalyticsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="locationName" />
                <YAxis />
                <RechartsTooltip formatter={(value: any) => [`₹${(value / 1000000).toFixed(1)}L`, 'Revenue']} />
                <Legend />
                <Bar dataKey="revenue" fill="#8884d8" />
                <Bar dataKey="gstLiability" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={4}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Compliance Score Distribution
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={locations.map(loc => ({
                    name: loc.name.split(' ')[0],
                    value: loc.complianceScore
                  }))}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}%`}
                >
                  {locations.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const renderLocationDetails = () => (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Location Performance Details
        </Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Location</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Revenue</TableCell>
                <TableCell>GST Liability</TableCell>
                <TableCell>ITC Availed</TableCell>
                <TableCell>Compliance</TableCell>
                <TableCell>Filing Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredAnalyticsData.map((data) => {
                const location = locations.find(l => l.id === data.locationId);
                return (
                  <TableRow key={data.locationId} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <LocationIcon sx={{ mr: 1, color: 'primary.main' }} />
                        <Box>
                          <Typography variant="body2" fontWeight="medium">
                            {data.locationName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {location?.gstin}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={location?.type.toUpperCase()}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        ₹{(data.revenue / 1000000).toFixed(1)}L
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {data.transactionCount} transactions
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        ₹{(data.gstLiability / 1000000).toFixed(1)}L
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        ₹{(data.itcAvailed / 1000).toFixed(0)}K
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <LinearProgress
                          variant="determinate"
                          value={data.complianceMetrics.filingAccuracy}
                          sx={{ width: 60, mr: 1 }}
                        />
                        <Typography variant="body2">
                          {data.complianceMetrics.filingAccuracy.toFixed(1)}%
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={data.filingStatus.toUpperCase()}
                        color={data.filingStatus === 'compliant' ? 'success' : 'warning'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Tooltip title="View Details">
                        <IconButton size="small">
                          <AnalyticsIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Generate Report">
                        <IconButton size="small">
                          <ReportIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );

  const renderReportsManagement = () => (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6">
            Report Management
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="contained"
              startIcon={<ReportIcon />}
              onClick={handleGenerateReport}
            >
              Generate Report
            </Button>
            <Button
              variant="outlined"
              startIcon={<ScheduleIcon />}
              onClick={handleScheduleReport}
            >
              Schedule
            </Button>
          </Box>
        </Box>

        {reports.map((report) => (
          <Card key={report.id} variant="outlined" sx={{ mb: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Box>
                  <Typography variant="subtitle1" fontWeight="medium">
                    {report.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {report.type.toUpperCase()} • {report.locations.length} locations • Created: {new Date(report.createdAt).toLocaleDateString()}
                  </Typography>
                </Box>
                <Chip
                  label={report.status.toUpperCase()}
                  color={report.status === 'completed' ? 'success' : report.status === 'generating' ? 'info' : 'error'}
                  size="small"
                />
              </Box>

              {report.insights.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" fontWeight="medium" gutterBottom>
                    Key Insights ({report.insights.length})
                  </Typography>
                  {report.insights.slice(0, 2).map((insight, index) => (
                    <Alert
                      key={index}
                      severity={insight.severity === 'high' ? 'error' : insight.severity === 'medium' ? 'warning' : 'info'}
                      sx={{ mb: 1 }}
                    >
                      <Typography variant="body2" fontWeight="medium">
                        {insight.title}
                      </Typography>
                      <Typography variant="caption">
                        {insight.description}
                      </Typography>
                    </Alert>
                  ))}
                  {report.insights.length > 2 && (
                    <Button size="small" onClick={handleViewInsights}>
                      View All {report.insights.length} Insights
                    </Button>
                  )}
                </Box>
              )}

              <Box sx={{ display: 'flex', gap: 1 }}>
                {report.status === 'completed' && (
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<DownloadIcon />}
                  >
                    Download PDF
                  </Button>
                )}
                <Button size="small" variant="outlined" startIcon={<ShareIcon />}>
                  Share
                </Button>
                <Button size="small" variant="outlined">
                  Duplicate
                </Button>
              </Box>
            </CardContent>
          </Card>
        ))}
      </CardContent>
    </Card>
  );

  const renderTrendAnalysis = () => {
    const trendData = [
      { month: 'Jul', revenue: 8500000, gst: 1530000, compliance: 94 },
      { month: 'Aug', revenue: 9200000, gst: 1656000, compliance: 96 },
      { month: 'Sep', revenue: 10100000, gst: 1818000, compliance: 95 },
    ];

    return (
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Revenue & GST Trend (Multi-location)
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <ComposedChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <RechartsTooltip 
                    formatter={(value: any, name: string) => [
                      name === 'compliance' ? `${value}%` : `₹${(value / 1000000).toFixed(1)}L`,
                      name === 'revenue' ? 'Revenue' : name === 'gst' ? 'GST Liability' : 'Compliance'
                    ]}
                  />
                  <Legend />
                  <Bar yAxisId="left" dataKey="revenue" fill="#8884d8" name="revenue" />
                  <Bar yAxisId="left" dataKey="gst" fill="#82ca9d" name="gst" />
                  <Line yAxisId="right" type="monotone" dataKey="compliance" stroke="#ff7300" name="compliance" strokeWidth={3} />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Performance Insights
              </Typography>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <TrendingUpIcon color="success" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Revenue Growth"
                    secondary="18.8% increase over last quarter"
                  />
                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemIcon>
                    <CheckCircleIcon color="success" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Compliance Stable"
                    secondary="Maintaining 95%+ across locations"
                  />
                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemIcon>
                    <WarningIcon color="warning" />
                  </ListItemIcon>
                  <ListItemText
                    primary="GST Rate Increase"
                    secondary="2.1% higher than projected"
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    );
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Advanced Analytics
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Multi-location business intelligence and comprehensive GST compliance analytics
        </Typography>
      </Box>

      {/* Location Selector */}
      {renderLocationSelector()}

      {/* Summary Stats */}
      {renderSummaryStats()}

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab label="Location Comparison" />
          <Tab label="Trend Analysis" />
          <Tab label="Detailed Reports" />
          <Tab label="Report Management" />
        </Tabs>
      </Box>

      {/* Tab Content */}
      {activeTab === 0 && (
        <Box>
          {renderLocationComparison()}
          <Box sx={{ mt: 4 }}>
            {renderLocationDetails()}
          </Box>
        </Box>
      )}
      {activeTab === 1 && renderTrendAnalysis()}
      {activeTab === 2 && renderLocationDetails()}
      {activeTab === 3 && renderReportsManagement()}

      {/* Dialogs */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {dialogType === 'generate' && 'Generate Custom Report'}
          {dialogType === 'schedule' && 'Schedule Automated Report'}
          {dialogType === 'insights' && 'AI-Generated Insights'}
        </DialogTitle>
        <DialogContent>
          {dialogType === 'generate' && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Report Name"
                  variant="outlined"
                  defaultValue="Multi-location Analysis"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Report Type</InputLabel>
                  <Select label="Report Type">
                    <MenuItem value="financial">Financial Summary</MenuItem>
                    <MenuItem value="compliance">Compliance Report</MenuItem>
                    <MenuItem value="comparative">Comparative Analysis</MenuItem>
                    <MenuItem value="trend">Trend Analysis</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Include Locations</InputLabel>
                  <Select
                    multiple
                    defaultValue={['loc-001', 'loc-002']}
                    label="Include Locations"
                  >
                    {locations.map((location) => (
                      <MenuItem key={location.id} value={location.id}>
                        {location.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          )}

          {dialogType === 'schedule' && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <Alert severity="info" sx={{ mb: 2 }}>
                  Set up automated report generation and distribution for stakeholders
                </Alert>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Frequency</InputLabel>
                  <Select label="Frequency">
                    <MenuItem value="weekly">Weekly</MenuItem>
                    <MenuItem value="monthly">Monthly</MenuItem>
                    <MenuItem value="quarterly">Quarterly</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Recipients"
                  variant="outlined"
                  placeholder="email@company.com"
                  helperText="Comma-separated email addresses"
                />
              </Grid>
            </Grid>
          )}

          {dialogType === 'insights' && (
            <Box>
              <Alert severity="success" sx={{ mb: 3 }}>
                AI-powered insights based on your multi-location data patterns
              </Alert>
              {reports[0]?.insights.map((insight, index) => (
                <Alert
                  key={index}
                  severity={insight.severity === 'high' ? 'error' : insight.severity === 'medium' ? 'warning' : 'info'}
                  sx={{ mb: 2 }}
                >
                  <Typography variant="body1" fontWeight="medium" gutterBottom>
                    {insight.title}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    {insight.description}
                  </Typography>
                  {insight.actionRequired && (
                    <Button size="small" variant="outlined" sx={{ mt: 1 }}>
                      Take Action
                    </Button>
                  )}
                </Alert>
              ))}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained">
            {dialogType === 'generate' && 'Generate Report'}
            {dialogType === 'schedule' && 'Schedule Report'}
            {dialogType === 'insights' && 'Close'}
          </Button>
        </DialogActions>
      </Dialog>

      {loading && (
        <Box sx={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999 }}>
          <LinearProgress />
        </Box>
      )}
    </Box>
  );
};