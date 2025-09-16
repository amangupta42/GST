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
  LinearProgress,
  Alert,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  FormControl,
  InputLabel,
  Divider,
  Tooltip,
  Paper,
  ListItem,
  ListItemIcon,
  ListItemText,
  List,
  Tabs,
  Tab
} from '@mui/material';
import {
  LocalShipping as ShippingIcon,
  LocationOn as LocationIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Refresh as RefreshIcon,
  Add as AddIcon,
  MoreVert as MoreIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Print as PrintIcon,
  Download as DownloadIcon,
  Navigation as GPSIcon,
  LocalShipping as TruckIcon,
  Route as RouteIcon,
  Timer as TimerIcon,
  Traffic as TrafficIcon,
  Speed as SpeedIcon,
  Warning as EmergencyIcon
} from '@mui/icons-material';

interface Vehicle {
  id: string;
  vehicleNumber: string;
  vehicleType: 'truck' | 'van' | 'car' | 'bike' | 'other';
  driverName: string;
  driverLicense: string;
  gpsEnabled: boolean;
  status: 'active' | 'inactive' | 'maintenance';
  currentLocation?: {
    latitude: number;
    longitude: number;
    address: string;
    timestamp: string;
  };
}

interface EWayBill {
  id: string;
  ewbNumber: string;
  documentNumber: string;
  documentDate: string;
  documentType: 'tax_invoice' | 'bill_of_supply' | 'delivery_challan' | 'others';
  supplierGSTIN: string;
  supplierName: string;
  supplierAddress: string;
  recipientGSTIN: string;
  recipientName: string;
  recipientAddress: string;
  vehicleNumber: string;
  transporterName: string;
  transporterID: string;
  approximateDistance: number;
  goodsValue: number;
  hsnCode: string;
  goodsDescription: string;
  quantity: number;
  unit: string;
  taxableValue: number;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  cessAmount: number;
  validFrom: string;
  validUpto: string;
  status: 'active' | 'cancelled' | 'expired' | 'in_transit' | 'delivered';
  generatedBy: string;
  generatedDate: string;
  trackingInfo?: {
    currentLocation: {
      latitude: number;
      longitude: number;
      address: string;
      timestamp: string;
    };
    route: Array<{
      latitude: number;
      longitude: number;
      timestamp: string;
      speed?: number;
    }>;
    estimatedDelivery: string;
    delayReason?: string;
    alerts: Array<{
      type: 'route_deviation' | 'speed_violation' | 'delay' | 'emergency';
      message: string;
      timestamp: string;
      severity: 'low' | 'medium' | 'high';
    }>;
  };
}

interface BatchJob {
  id: string;
  type: 'generate' | 'cancel' | 'update' | 'track';
  totalCount: number;
  processedCount: number;
  successCount: number;
  failureCount: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: string;
  completedAt?: string;
  errors: Array<{
    documentNumber: string;
    error: string;
    code: string;
  }>;
}

interface EWayBillHubProps {
  onNavigate?: (path: string) => void;
}

export const EWayBillHub = ({ onNavigate }: EWayBillHubProps) => {
  const [activeTab, setActiveTab] = useState(0);
  const [eWayBills, setEWayBills] = useState<EWayBill[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [batchJobs, setBatchJobs] = useState<BatchJob[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedEWayBill, setSelectedEWayBill] = useState<EWayBill | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<'generate' | 'track' | 'cancel' | 'vehicle'>('generate');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Mock data initialization
  const mockEWayBills: EWayBill[] = useMemo(() => [
    {
      id: 'ewb-001',
      ewbNumber: '141234567890',
      documentNumber: 'INV-2024-001',
      documentDate: '2024-09-10',
      documentType: 'tax_invoice',
      supplierGSTIN: '27AAAAA0000A1Z5',
      supplierName: 'ABC Manufacturing Ltd',
      supplierAddress: 'Mumbai, Maharashtra',
      recipientGSTIN: '29BBBBB1111B2Y6',
      recipientName: 'XYZ Traders',
      recipientAddress: 'Bangalore, Karnataka',
      vehicleNumber: 'MH-01-AB-1234',
      transporterName: 'FastTrack Logistics',
      transporterID: 'TRN12345',
      approximateDistance: 840,
      goodsValue: 250000,
      hsnCode: '8471',
      goodsDescription: 'Computer Hardware',
      quantity: 10,
      unit: 'PCS',
      taxableValue: 250000,
      cgstAmount: 22500,
      sgstAmount: 22500,
      igstAmount: 0,
      cessAmount: 0,
      validFrom: '2024-09-10T10:00:00Z',
      validUpto: '2024-09-15T23:59:59Z',
      status: 'in_transit',
      generatedBy: 'user123',
      generatedDate: '2024-09-10T10:00:00Z',
      trackingInfo: {
        currentLocation: {
          latitude: 15.3173,
          longitude: 75.7139,
          address: 'Hubli, Karnataka',
          timestamp: '2024-09-13T14:30:00Z'
        },
        route: [
          { latitude: 19.0760, longitude: 72.8777, timestamp: '2024-09-10T11:00:00Z', speed: 60 },
          { latitude: 17.3850, longitude: 78.4867, timestamp: '2024-09-11T15:30:00Z', speed: 70 },
          { latitude: 15.3173, longitude: 75.7139, timestamp: '2024-09-13T14:30:00Z', speed: 55 }
        ],
        estimatedDelivery: '2024-09-14T18:00:00Z',
        alerts: [
          {
            type: 'delay',
            message: 'Vehicle delayed by 2 hours due to traffic',
            timestamp: '2024-09-13T12:00:00Z',
            severity: 'medium'
          }
        ]
      }
    },
    {
      id: 'ewb-002',
      ewbNumber: '141234567891',
      documentNumber: 'INV-2024-002',
      documentDate: '2024-09-12',
      documentType: 'bill_of_supply',
      supplierGSTIN: '27AAAAA0000A1Z5',
      supplierName: 'ABC Manufacturing Ltd',
      supplierAddress: 'Mumbai, Maharashtra',
      recipientGSTIN: '07CCCCC2222C3X7',
      recipientName: 'Delhi Distributors',
      recipientAddress: 'New Delhi, Delhi',
      vehicleNumber: 'DL-01-CD-5678',
      transporterName: 'Express Cargo',
      transporterID: 'TRN54321',
      approximateDistance: 1400,
      goodsValue: 180000,
      hsnCode: '9403',
      goodsDescription: 'Office Furniture',
      quantity: 25,
      unit: 'PCS',
      taxableValue: 180000,
      cgstAmount: 16200,
      sgstAmount: 16200,
      igstAmount: 0,
      cessAmount: 0,
      validFrom: '2024-09-12T09:00:00Z',
      validUpto: '2024-09-17T23:59:59Z',
      status: 'active',
      generatedBy: 'user123',
      generatedDate: '2024-09-12T09:00:00Z'
    }
  ], []);

  const mockVehicles: Vehicle[] = useMemo(() => [
    {
      id: 'veh-001',
      vehicleNumber: 'MH-01-AB-1234',
      vehicleType: 'truck',
      driverName: 'Rajesh Kumar',
      driverLicense: 'DL-2020-001',
      gpsEnabled: true,
      status: 'active',
      currentLocation: {
        latitude: 15.3173,
        longitude: 75.7139,
        address: 'Hubli, Karnataka',
        timestamp: '2024-09-13T14:30:00Z'
      }
    },
    {
      id: 'veh-002',
      vehicleNumber: 'DL-01-CD-5678',
      vehicleType: 'van',
      driverName: 'Suresh Singh',
      driverLicense: 'DL-2021-002',
      gpsEnabled: true,
      status: 'active',
      currentLocation: {
        latitude: 28.7041,
        longitude: 77.1025,
        address: 'New Delhi, Delhi',
        timestamp: '2024-09-13T15:00:00Z'
      }
    }
  ], []);

  const mockBatchJobs: BatchJob[] = useMemo(() => [
    {
      id: 'batch-001',
      type: 'generate',
      totalCount: 50,
      processedCount: 45,
      successCount: 42,
      failureCount: 3,
      status: 'processing',
      createdAt: '2024-09-13T10:00:00Z',
      errors: [
        { documentNumber: 'INV-2024-010', error: 'Invalid GSTIN format', code: 'E1001' },
        { documentNumber: 'INV-2024-015', error: 'Recipient not found', code: 'E1002' },
        { documentNumber: 'INV-2024-020', error: 'Vehicle number invalid', code: 'E1003' }
      ]
    }
  ], []);

  // Initialize mock data
  useState(() => {
    setEWayBills(mockEWayBills);
    setVehicles(mockVehicles);
    setBatchJobs(mockBatchJobs);
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'in_transit': return 'info';
      case 'delivered': return 'success';
      case 'cancelled': return 'error';
      case 'expired': return 'warning';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircleIcon />;
      case 'in_transit': return <ShippingIcon />;
      case 'delivered': return <CheckCircleIcon />;
      case 'cancelled': return <ErrorIcon />;
      case 'expired': return <WarningIcon />;
      default: return <ScheduleIcon />;
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleGenerateEWayBill = useCallback(() => {
    setDialogType('generate');
    setDialogOpen(true);
  }, []);

  const handleBulkGeneration = useCallback(() => {
    setLoading(true);
    // Simulate bulk generation
    setTimeout(() => {
      setLoading(false);
      // Add success notification
    }, 2000);
  }, []);

  const handleTrackVehicle = useCallback((eWayBill: EWayBill) => {
    setSelectedEWayBill(eWayBill);
    setDialogType('track');
    setDialogOpen(true);
  }, []);

  const handleCancelEWayBill = useCallback((eWayBill: EWayBill) => {
    setSelectedEWayBill(eWayBill);
    setDialogType('cancel');
    setDialogOpen(true);
  }, []);

  const handleVehicleManagement = useCallback(() => {
    setDialogType('vehicle');
    setDialogOpen(true);
  }, []);

  const renderSummaryStats = () => (
    <Grid container spacing={3} sx={{ mb: 4 }}>
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar sx={{ bgcolor: 'primary.light', mr: 2 }}>
                <ShippingIcon />
              </Avatar>
              <Typography variant="subtitle2" color="text.secondary">
                Active E-way Bills
              </Typography>
            </Box>
            <Typography variant="h4" component="div" gutterBottom>
              {eWayBills.filter(e => e.status === 'active' || e.status === 'in_transit').length}
            </Typography>
            <Typography variant="body2" color="primary.main">
              ₹{eWayBills.filter(e => e.status === 'active' || e.status === 'in_transit').reduce((sum, e) => sum + e.goodsValue, 0).toLocaleString()} value
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar sx={{ bgcolor: 'success.light', mr: 2 }}>
                <TruckIcon />
              </Avatar>
              <Typography variant="subtitle2" color="text.secondary">
                Active Vehicles
              </Typography>
            </Box>
            <Typography variant="h4" component="div" gutterBottom>
              {vehicles.filter(v => v.status === 'active').length}
            </Typography>
            <Typography variant="body2" color="success.main">
              {vehicles.filter(v => v.gpsEnabled).length} GPS enabled
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar sx={{ bgcolor: 'info.light', mr: 2 }}>
                <RouteIcon />
              </Avatar>
              <Typography variant="subtitle2" color="text.secondary">
                Distance Covered
              </Typography>
            </Box>
            <Typography variant="h4" component="div" gutterBottom>
              {eWayBills.reduce((sum, e) => sum + e.approximateDistance, 0).toLocaleString()} km
            </Typography>
            <Typography variant="body2" color="info.main">
              This month
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar sx={{ bgcolor: 'warning.light', mr: 2 }}>
                <WarningIcon />
              </Avatar>
              <Typography variant="subtitle2" color="text.secondary">
                Active Alerts
              </Typography>
            </Box>
            <Typography variant="h4" component="div" gutterBottom>
              {eWayBills.reduce((sum, e) => sum + (e.trackingInfo?.alerts.length || 0), 0)}
            </Typography>
            <Typography variant="body2" color="warning.main">
              Need attention
            </Typography>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const renderQuickActions = () => (
    <Card sx={{ mb: 4 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Quick Actions
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              variant="outlined"
              fullWidth
              startIcon={<AddIcon />}
              onClick={handleGenerateEWayBill}
              sx={{ height: 60, flexDirection: 'column', gap: 1 }}
            >
              <Typography variant="subtitle2">Generate E-way Bill</Typography>
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              variant="outlined"
              fullWidth
              startIcon={<ShippingIcon />}
              onClick={handleBulkGeneration}
              sx={{ height: 60, flexDirection: 'column', gap: 1 }}
            >
              <Typography variant="subtitle2">Bulk Generation</Typography>
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              variant="outlined"
              fullWidth
              startIcon={<TruckIcon />}
              onClick={handleVehicleManagement}
              sx={{ height: 60, flexDirection: 'column', gap: 1 }}
            >
              <Typography variant="subtitle2">Manage Vehicles</Typography>
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              variant="outlined"
              fullWidth
              startIcon={<GPSIcon />}
              sx={{ height: 60, flexDirection: 'column', gap: 1 }}
            >
              <Typography variant="subtitle2">Live Tracking</Typography>
            </Button>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );

  const renderEWayBillsList = () => (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6">
            E-way Bills
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleGenerateEWayBill}
            >
              Generate
            </Button>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={() => setLoading(true)}
            >
              Refresh
            </Button>
          </Box>
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>E-way Bill Number</TableCell>
                <TableCell>Document</TableCell>
                <TableCell>Route</TableCell>
                <TableCell>Vehicle</TableCell>
                <TableCell>Value</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Valid Until</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {eWayBills.map((eWayBill) => (
                <TableRow key={eWayBill.id} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight="medium">
                      {eWayBill.ewbNumber}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {eWayBill.documentNumber}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {eWayBill.documentType.replace('_', ' ').toUpperCase()}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(eWayBill.documentDate).toLocaleDateString()}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {eWayBill.supplierAddress.split(',')[0]} → {eWayBill.recipientAddress.split(',')[0]}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {eWayBill.approximateDistance} km
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="medium">
                      {eWayBill.vehicleNumber}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {eWayBill.transporterName}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="medium">
                      ₹{eWayBill.goodsValue.toLocaleString()}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      icon={getStatusIcon(eWayBill.status)}
                      label={eWayBill.status.replace('_', ' ').toUpperCase()}
                      color={getStatusColor(eWayBill.status) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {new Date(eWayBill.validUpto).toLocaleDateString()}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="Track Vehicle">
                      <IconButton
                        size="small"
                        onClick={() => handleTrackVehicle(eWayBill)}
                        disabled={!eWayBill.trackingInfo}
                      >
                        <GPSIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="View Details">
                      <IconButton size="small">
                        <ViewIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="More Actions">
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          setAnchorEl(e.currentTarget);
                          setSelectedEWayBill(eWayBill);
                        }}
                      >
                        <MoreIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={() => setAnchorEl(null)}
        >
          <MenuItem onClick={() => {
            if (selectedEWayBill) handleTrackVehicle(selectedEWayBill);
            setAnchorEl(null);
          }}>
            <ListItemIcon><GPSIcon fontSize="small" /></ListItemIcon>
            <ListItemText>Track Vehicle</ListItemText>
          </MenuItem>
          <MenuItem onClick={() => {
            setAnchorEl(null);
          }}>
            <ListItemIcon><EditIcon fontSize="small" /></ListItemIcon>
            <ListItemText>Update Details</ListItemText>
          </MenuItem>
          <MenuItem onClick={() => {
            if (selectedEWayBill) handleCancelEWayBill(selectedEWayBill);
            setAnchorEl(null);
          }}>
            <ListItemIcon><ErrorIcon fontSize="small" /></ListItemIcon>
            <ListItemText>Cancel E-way Bill</ListItemText>
          </MenuItem>
          <MenuItem onClick={() => setAnchorEl(null)}>
            <ListItemIcon><PrintIcon fontSize="small" /></ListItemIcon>
            <ListItemText>Print</ListItemText>
          </MenuItem>
          <MenuItem onClick={() => setAnchorEl(null)}>
            <ListItemIcon><DownloadIcon fontSize="small" /></ListItemIcon>
            <ListItemText>Download PDF</ListItemText>
          </MenuItem>
        </Menu>
      </CardContent>
    </Card>
  );

  const renderVehicleTracking = () => (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Vehicle Tracking
        </Typography>
        <Grid container spacing={3}>
          {vehicles.filter(v => v.gpsEnabled).map((vehicle) => (
            <Grid item xs={12} md={6} key={vehicle.id}>
              <Card variant="outlined">
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box>
                      <Typography variant="subtitle1" fontWeight="medium">
                        {vehicle.vehicleNumber}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {vehicle.driverName} • {vehicle.vehicleType.toUpperCase()}
                      </Typography>
                    </Box>
                    <Chip
                      label={vehicle.status.toUpperCase()}
                      color={vehicle.status === 'active' ? 'success' : 'default'}
                      size="small"
                    />
                  </Box>

                  {vehicle.currentLocation && (
                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <LocationIcon sx={{ fontSize: 16, mr: 1, color: 'primary.main' }} />
                        <Typography variant="body2" color="text.secondary">
                          Current Location
                        </Typography>
                      </Box>
                      <Typography variant="body2" fontWeight="medium">
                        {vehicle.currentLocation.address}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Updated: {new Date(vehicle.currentLocation.timestamp).toLocaleString()}
                      </Typography>
                    </Box>
                  )}

                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button size="small" variant="outlined" startIcon={<GPSIcon />}>
                      Live Track
                    </Button>
                    <Button size="small" variant="outlined" startIcon={<RouteIcon />}>
                      Route History
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  );

  const renderBatchJobs = () => (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Batch Processing Jobs
        </Typography>
        {batchJobs.map((job) => (
          <Card key={job.id} variant="outlined" sx={{ mb: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Box>
                  <Typography variant="subtitle1" fontWeight="medium">
                    {job.type.charAt(0).toUpperCase() + job.type.slice(1)} E-way Bills
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Created: {new Date(job.createdAt).toLocaleString()}
                  </Typography>
                </Box>
                <Chip
                  label={job.status.toUpperCase()}
                  color={job.status === 'completed' ? 'success' : job.status === 'processing' ? 'info' : 'default'}
                  size="small"
                />
              </Box>

              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Progress</Typography>
                  <Typography variant="body2">
                    {job.processedCount}/{job.totalCount}
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={(job.processedCount / job.totalCount) * 100}
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Box>

              <Grid container spacing={2}>
                <Grid item xs={4}>
                  <Typography variant="caption" color="text.secondary">Processed</Typography>
                  <Typography variant="h6">{job.processedCount}</Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="caption" color="text.secondary">Success</Typography>
                  <Typography variant="h6" color="success.main">{job.successCount}</Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="caption" color="text.secondary">Failed</Typography>
                  <Typography variant="h6" color="error.main">{job.failureCount}</Typography>
                </Grid>
              </Grid>

              {job.errors.length > 0 && (
                <Alert severity="warning" sx={{ mt: 2 }}>
                  <Typography variant="body2" fontWeight="medium" gutterBottom>
                    {job.errors.length} documents failed processing
                  </Typography>
                  {job.errors.slice(0, 3).map((error, index) => (
                    <Typography key={index} variant="caption" display="block">
                      {error.documentNumber}: {error.error}
                    </Typography>
                  ))}
                  {job.errors.length > 3 && (
                    <Typography variant="caption" color="primary.main" sx={{ cursor: 'pointer' }}>
                      View {job.errors.length - 3} more errors
                    </Typography>
                  )}
                </Alert>
              )}
            </CardContent>
          </Card>
        ))}
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          E-way Bill Management
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Generate, track, and manage E-way bills with GPS integration and real-time monitoring
        </Typography>
      </Box>

      {/* Summary Stats */}
      {renderSummaryStats()}

      {/* Quick Actions */}
      {renderQuickActions()}

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab label="E-way Bills" />
          <Tab label="Vehicle Tracking" />
          <Tab label="Batch Jobs" />
        </Tabs>
      </Box>

      {/* Tab Content */}
      {activeTab === 0 && renderEWayBillsList()}
      {activeTab === 1 && renderVehicleTracking()}
      {activeTab === 2 && renderBatchJobs()}

      {/* Dialogs */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {dialogType === 'generate' && 'Generate E-way Bill'}
          {dialogType === 'track' && 'Vehicle Tracking Details'}
          {dialogType === 'cancel' && 'Cancel E-way Bill'}
          {dialogType === 'vehicle' && 'Vehicle Management'}
        </DialogTitle>
        <DialogContent>
          {dialogType === 'generate' && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Document Number"
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Document Date"
                  type="date"
                  variant="outlined"
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Document Type</InputLabel>
                  <Select label="Document Type">
                    <MenuItem value="tax_invoice">Tax Invoice</MenuItem>
                    <MenuItem value="bill_of_supply">Bill of Supply</MenuItem>
                    <MenuItem value="delivery_challan">Delivery Challan</MenuItem>
                    <MenuItem value="others">Others</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Supplier GSTIN"
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Recipient GSTIN"
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Vehicle Number"
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Transporter Name"
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Goods Description"
                  variant="outlined"
                  multiline
                  rows={2}
                />
              </Grid>
            </Grid>
          )}

          {dialogType === 'track' && selectedEWayBill?.trackingInfo && (
            <Box>
              <Alert severity="info" sx={{ mb: 3 }}>
                Real-time GPS tracking for {selectedEWayBill.vehicleNumber}
              </Alert>
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="h6" gutterBottom>
                      Current Status
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <LocationIcon sx={{ mr: 1, color: 'primary.main' }} />
                      <Box>
                        <Typography variant="body1" fontWeight="medium">
                          {selectedEWayBill.trackingInfo.currentLocation.address}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Last updated: {new Date(selectedEWayBill.trackingInfo.currentLocation.timestamp).toLocaleString()}
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <TimerIcon sx={{ mr: 1, color: 'success.main' }} />
                      <Box>
                        <Typography variant="body1" fontWeight="medium">
                          Estimated Delivery
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {new Date(selectedEWayBill.trackingInfo.estimatedDelivery).toLocaleString()}
                        </Typography>
                      </Box>
                    </Box>
                  </Paper>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="h6" gutterBottom>
                      Route Progress
                    </Typography>
                    <List dense>
                      {selectedEWayBill.trackingInfo.route.map((point, index) => (
                        <ListItem key={index}>
                          <ListItemIcon>
                            <LocationIcon 
                              color={index === selectedEWayBill.trackingInfo!.route.length - 1 ? 'primary' : 'action'} 
                            />
                          </ListItemIcon>
                          <ListItemText
                            primary={`Checkpoint ${index + 1}`}
                            secondary={`${new Date(point.timestamp).toLocaleString()} • ${point.speed || 'N/A'} km/h`}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Paper>
                </Grid>

                {selectedEWayBill.trackingInfo.alerts.length > 0 && (
                  <Grid item xs={12}>
                    <Paper sx={{ p: 2 }}>
                      <Typography variant="h6" gutterBottom>
                        Alerts & Notifications
                      </Typography>
                      {selectedEWayBill.trackingInfo.alerts.map((alert, index) => (
                        <Alert
                          key={index}
                          severity={alert.severity === 'high' ? 'error' : alert.severity === 'medium' ? 'warning' : 'info'}
                          sx={{ mb: 1 }}
                        >
                          <Typography variant="body2" fontWeight="medium">
                            {alert.message}
                          </Typography>
                          <Typography variant="caption">
                            {new Date(alert.timestamp).toLocaleString()}
                          </Typography>
                        </Alert>
                      ))}
                    </Paper>
                  </Grid>
                )}
              </Grid>
            </Box>
          )}

          {dialogType === 'cancel' && selectedEWayBill && (
            <Box>
              <Alert severity="warning" sx={{ mb: 3 }}>
                You are about to cancel E-way Bill {selectedEWayBill.ewbNumber}. This action cannot be undone.
              </Alert>
              <TextField
                fullWidth
                label="Reason for Cancellation"
                variant="outlined"
                multiline
                rows={3}
                sx={{ mt: 2 }}
              />
            </Box>
          )}

          {dialogType === 'vehicle' && (
            <Box>
              <Typography variant="body1" sx={{ mb: 3 }}>
                Manage your fleet of vehicles for E-way bill transportation.
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Vehicle Number"
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Vehicle Type</InputLabel>
                    <Select label="Vehicle Type">
                      <MenuItem value="truck">Truck</MenuItem>
                      <MenuItem value="van">Van</MenuItem>
                      <MenuItem value="car">Car</MenuItem>
                      <MenuItem value="bike">Bike</MenuItem>
                      <MenuItem value="other">Other</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Driver Name"
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Driver License"
                    variant="outlined"
                  />
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={() => {
              setLoading(true);
              setTimeout(() => {
                setLoading(false);
                setDialogOpen(false);
              }, 1000);
            }}
          >
            {dialogType === 'generate' && 'Generate E-way Bill'}
            {dialogType === 'track' && 'Refresh Tracking'}
            {dialogType === 'cancel' && 'Confirm Cancellation'}
            {dialogType === 'vehicle' && 'Save Vehicle'}
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