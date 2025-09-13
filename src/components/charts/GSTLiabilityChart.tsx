'use client';

import { Card, CardContent, Typography, Box, useTheme } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAppSelector } from '@/store';
import { selectChartData } from '@/store/slices/dashboardSlice';

export const GSTLiabilityChart = () => {
  const theme = useTheme();
  const chartData = useAppSelector(selectChartData);
  const data = chartData.gstLiability;

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          GST Liability Trend
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Monthly liability vs payments (₹)
        </Typography>
        <Box sx={{ width: '100%', height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
              <XAxis 
                dataKey="month" 
                stroke={theme.palette.text.secondary}
                fontSize={12}
              />
              <YAxis 
                stroke={theme.palette.text.secondary}
                fontSize={12}
                tickFormatter={(value) => `₹${value / 1000}K`}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: theme.palette.background.paper,
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: 8,
                }}
                labelStyle={{ color: theme.palette.text.primary }}
                formatter={(value: number, name: string) => [
                  `₹${value.toLocaleString()}`,
                  name === 'liability' ? 'Liability' : 'Paid'
                ]}
              />
              <Line 
                type="monotone" 
                dataKey="liability" 
                stroke={theme.palette.error.main}
                strokeWidth={3}
                dot={{ fill: theme.palette.error.main, strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: theme.palette.error.main, strokeWidth: 2 }}
              />
              <Line 
                type="monotone" 
                dataKey="paid" 
                stroke={theme.palette.success.main}
                strokeWidth={3}
                dot={{ fill: theme.palette.success.main, strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: theme.palette.success.main, strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 4, mt: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 12, height: 3, bgcolor: 'error.main', borderRadius: 1 }} />
            <Typography variant="caption">Liability</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 12, height: 3, bgcolor: 'success.main', borderRadius: 1 }} />
            <Typography variant="caption">Paid</Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};