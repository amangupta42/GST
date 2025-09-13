'use client';

import { Card, CardContent, Typography, Box, useTheme } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAppSelector } from '@/store';
import { selectChartData } from '@/store/slices/dashboardSlice';

export const ITCUtilizationChart = () => {
  const theme = useTheme();
  const chartData = useAppSelector(selectChartData);
  const data = chartData.itcUtilization;

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          ITC Utilization
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Available vs Utilized Input Tax Credit (₹)
        </Typography>
        <Box sx={{ width: '100%', height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
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
                  name === 'available' ? 'Available' : 'Utilized'
                ]}
              />
              <Bar 
                dataKey="available" 
                fill={theme.palette.info.light}
                radius={[4, 4, 0, 0]}
              />
              <Bar 
                dataKey="utilized" 
                fill={theme.palette.info.main}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 4, mt: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 12, height: 12, bgcolor: 'info.light', borderRadius: 1 }} />
            <Typography variant="caption">Available</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 12, height: 12, bgcolor: 'info.main', borderRadius: 1 }} />
            <Typography variant="caption">Utilized</Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};