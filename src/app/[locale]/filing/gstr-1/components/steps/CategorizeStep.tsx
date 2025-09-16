'use client';

import { useState, useCallback, useMemo } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Chip,
  Alert,
  Tabs,
  Tab,
  Autocomplete,
  TextField
} from '@mui/material';
import {
  Business as B2BIcon,
  Person as B2CIcon,
  Public as ExportIcon,
  Block as NilRatedIcon,
  Category as CategoryIcon
} from '@mui/icons-material';
import { FilingData, InvoiceData } from '../FilingWizard';
import { hsnCodes, searchHSNCodes, getHSNCodeDetails, getSuggestedGSTRate } from '@/lib/data/hsn-codes';

interface CategorizeStepProps {
  data: FilingData;
  onUpdate: (updates: Partial<FilingData>) => void;
  onNext: () => void;
  onBack: () => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
}

const categories = [
  { value: 'B2B', label: 'B2B (Business to Business)', icon: B2BIcon, description: 'Sales to registered businesses' },
  { value: 'B2C', label: 'B2C (Business to Consumer)', icon: B2CIcon, description: 'Sales to unregistered customers' },
  { value: 'Export', label: 'Export', icon: ExportIcon, description: 'Sales to overseas customers' },
  { value: 'NilRated', label: 'Nil Rated', icon: NilRatedIcon, description: 'Sales with 0% GST rate' }
] as const;

export const CategorizeStep = ({ data, onUpdate }: CategorizeStepProps) => {
  const [currentTab, setCurrentTab] = useState(0);
  const [bulkCategory, setBulkCategory] = useState<string>('');

  const invoicesByCategory = useMemo(() => {
    return {
      all: data.invoices,
      uncategorized: data.invoices.filter(inv => !inv.category),
      B2B: data.invoices.filter(inv => inv.category === 'B2B'),
      B2C: data.invoices.filter(inv => inv.category === 'B2C'),
      Export: data.invoices.filter(inv => inv.category === 'Export'),
      NilRated: data.invoices.filter(inv => inv.category === 'NilRated')
    };
  }, [data.invoices]);

  const handleCategoryChange = useCallback((invoiceId: string, category: string) => {
    const updatedInvoices = data.invoices.map(inv => 
      inv.id === invoiceId ? { ...inv, category: category as InvoiceData['category'] } : inv
    );
    
    onUpdate({ invoices: updatedInvoices });
  }, [data.invoices, onUpdate]);

  const handleBulkCategorize = useCallback(() => {
    if (!bulkCategory) return;
    
    const uncategorizedInvoices = data.invoices.filter(inv => !inv.category);
    const updatedInvoices = data.invoices.map(inv => 
      uncategorizedInvoices.includes(inv) 
        ? { ...inv, category: bulkCategory as InvoiceData['category'] }
        : inv
    );
    
    onUpdate({ invoices: updatedInvoices });
    setBulkCategory('');
  }, [data.invoices, bulkCategory, onUpdate]);

  const handleHSNSuggestion = useCallback((invoiceId: string, hsnCode: string) => {
    const hsnDetails = getHSNCodeDetails(hsnCode);
    const suggestedGSTRate = getSuggestedGSTRate(hsnCode);
    
    const updatedInvoices = data.invoices.map(inv => {
      if (inv.id === invoiceId) {
        // Auto-update GST rates based on HSN code
        const taxableValue = inv.taxableValue;
        const gstRate = suggestedGSTRate / 100;
        const totalGst = taxableValue * gstRate;
        const cgst = totalGst / 2;
        const sgst = totalGst / 2;
        
        return { 
          ...inv, 
          hsnCode,
          description: hsnDetails?.description || inv.description,
          cgstAmount: cgst,
          sgstAmount: sgst,
          igstAmount: 0, // Assuming intrastate transaction
          invoiceValue: taxableValue + totalGst
        };
      }
      return inv;
    });
    
    onUpdate({ invoices: updatedInvoices });
  }, [data.invoices, onUpdate]);

  const autoCategorize = useCallback(() => {
    const updatedInvoices = data.invoices.map(invoice => {
      if (invoice.category) return invoice;
      
      // Auto-categorization logic
      let suggestedCategory: InvoiceData['category'] = 'B2B';
      
      // If customer has GSTIN, it's B2B
      if (invoice.customerGSTIN && invoice.customerGSTIN.trim() !== '') {
        suggestedCategory = 'B2B';
      }
      // If invoice value is high (>50000), likely B2B
      else if (invoice.invoiceValue > 50000) {
        suggestedCategory = 'B2B';
      }
      // If no GST charged, likely Nil rated
      else if (invoice.cgstAmount === 0 && invoice.sgstAmount === 0 && invoice.igstAmount === 0) {
        suggestedCategory = 'NilRated';
      }
      // Otherwise B2C
      else {
        suggestedCategory = 'B2C';
      }
      
      return { ...invoice, category: suggestedCategory };
    });
    
    onUpdate({ invoices: updatedInvoices });
  }, [data.invoices, onUpdate]);

  const getDisplayInvoices = () => {
    switch (currentTab) {
      case 1: return invoicesByCategory.uncategorized;
      case 2: return invoicesByCategory.B2B;
      case 3: return invoicesByCategory.B2C;
      case 4: return invoicesByCategory.Export;
      case 5: return invoicesByCategory.NilRated;
      default: return invoicesByCategory.all;
    }
  };

  const CategoryIconComponent = ({ category }: { category: string }) => {
    const categoryConfig = categories.find(cat => cat.value === category);
    const Icon = categoryConfig?.icon || CategoryIcon;
    return <Icon fontSize="small" />;
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h6" gutterBottom>
            Categorize Transactions
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Classify your invoices as B2B, B2C, Export, or Nil-rated for proper GST reporting.
          </Typography>
        </Box>
        
        <Button
          onClick={autoCategorize}
          variant="contained"
          color="secondary"
          startIcon={<CategoryIcon />}
        >
          Auto Categorize
        </Button>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {categories.map((category) => {
          const count = invoicesByCategory[category.value as keyof typeof invoicesByCategory]?.length || 0;
          const Icon = category.icon;
          return (
            <Grid item xs={12} sm={6} md={3} key={category.value}>
              <Card>
                <CardContent sx={{ textAlign: 'center', py: 2 }}>
                  <Icon color="primary" sx={{ fontSize: 32, mb: 1 }} />
                  <Typography variant="h4" color="primary">
                    {count}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {category.label.split(' ')[0]}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Status Alert */}
      {invoicesByCategory.uncategorized.length > 0 ? (
        <Alert severity="warning" sx={{ mb: 3 }}>
          {invoicesByCategory.uncategorized.length} invoices need to be categorized before proceeding.
        </Alert>
      ) : (
        <Alert severity="success" sx={{ mb: 3 }}>
          All invoices have been categorized successfully!
        </Alert>
      )}

      {/* Bulk Operations */}
      {invoicesByCategory.uncategorized.length > 0 && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Bulk Categorization
            </Typography>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Apply to all uncategorized</InputLabel>
                  <Select
                    value={bulkCategory}
                    onChange={(e) => setBulkCategory(e.target.value)}
                    label="Apply to all uncategorized"
                  >
                    {categories.map((category) => (
                      <MenuItem key={category.value} value={category.value}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <CategoryIconComponent category={category.value} />
                          {category.label}
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Button
                  onClick={handleBulkCategorize}
                  disabled={!bulkCategory}
                  variant="outlined"
                  fullWidth
                >
                  Apply to {invoicesByCategory.uncategorized.length} invoices
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Filter Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={currentTab} onChange={(e, v) => setCurrentTab(v)} variant="scrollable">
          <Tab label={`All (${invoicesByCategory.all.length})`} />
          <Tab label={`Uncategorized (${invoicesByCategory.uncategorized.length})`} />
          <Tab label={`B2B (${invoicesByCategory.B2B.length})`} />
          <Tab label={`B2C (${invoicesByCategory.B2C.length})`} />
          <Tab label={`Export (${invoicesByCategory.Export.length})`} />
          <Tab label={`Nil Rated (${invoicesByCategory.NilRated.length})`} />
        </Tabs>
      </Box>

      {/* Invoice Table */}
      <TableContainer component={Paper} sx={{ overflowX: 'auto' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Invoice #</TableCell>
              <TableCell>Customer</TableCell>
              <TableCell>GSTIN</TableCell>
              <TableCell align="right">Value</TableCell>
              <TableCell>HSN Code</TableCell>
              <TableCell>Category</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {getDisplayInvoices().map((invoice) => (
              <TableRow key={invoice.id}>
                <TableCell>{invoice.invoiceNumber}</TableCell>
                <TableCell>{invoice.customerName}</TableCell>
                <TableCell>
                  {invoice.customerGSTIN ? (
                    <Chip label={invoice.customerGSTIN} size="small" />
                  ) : (
                    <Typography variant="body2" color="text.secondary">No GSTIN</Typography>
                  )}
                </TableCell>
                <TableCell align="right">
                  ₹{invoice.invoiceValue.toLocaleString()}
                </TableCell>
                <TableCell>
                  <Autocomplete
                    size="small"
                    value={invoice.hsnCode}
                    onChange={(e, value) => handleHSNSuggestion(invoice.id, value || '')}
                    options={hsnCodes.map(hsn => hsn.code)}
                    getOptionLabel={(option) => option}
                    filterOptions={(options, { inputValue }) => {
                      if (!inputValue) return options.slice(0, 20); // Show first 20 if no input
                      const filtered = searchHSNCodes(inputValue);
                      return filtered.map(hsn => hsn.code).slice(0, 10);
                    }}
                    renderOption={(props, option) => {
                      const hsn = getHSNCodeDetails(option);
                      return (
                        <li {...props}>
                          <Box sx={{ width: '100%' }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Typography variant="body2" fontWeight="medium">{option}</Typography>
                              <Chip 
                                label={`${hsn?.gstRate || 18}%`} 
                                size="small" 
                                color="primary" 
                                variant="outlined"
                              />
                            </Box>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                              {hsn?.description}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
                              Chapter: {hsn?.chapter}
                            </Typography>
                          </Box>
                        </li>
                      );
                    }}
                    renderInput={(params) => (
                      <TextField 
                        {...params} 
                        placeholder="Search HSN Code" 
                        variant="outlined"
                        helperText={invoice.hsnCode ? `${getSuggestedGSTRate(invoice.hsnCode)}% GST` : ''}
                      />
                    )}
                    sx={{ minWidth: 160 }}
                  />
                </TableCell>
                <TableCell>
                  <FormControl size="small" sx={{ minWidth: 120 }}>
                    <Select
                      value={invoice.category || ''}
                      onChange={(e) => handleCategoryChange(invoice.id, e.target.value)}
                      displayEmpty
                    >
                      <MenuItem value="">
                        <em>Select Category</em>
                      </MenuItem>
                      {categories.map((category) => (
                        <MenuItem key={category.value} value={category.value}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <CategoryIconComponent category={category.value} />
                            {category.value}
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Category Definitions */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Category Definitions
          </Typography>
          <Grid container spacing={2}>
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <Grid item xs={12} sm={6} key={category.value}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                    <Icon color="primary" />
                    <Box>
                      <Typography variant="subtitle2">{category.label}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {category.description}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              );
            })}
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};