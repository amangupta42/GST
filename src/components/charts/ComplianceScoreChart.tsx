'use client';

import { Card, CardContent, Typography, Box, useTheme } from '@mui/material';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { useAppSelector } from '@/store';
import { selectChartData } from '@/store/slices/dashboardSlice';

export const ComplianceScoreChart = () => {
  const theme = useTheme();
  const chartData = useAppSelector(selectChartData);
  const data = chartData.complianceBreakdown;

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <Box
          sx={{
            backgroundColor: theme.palette.background.paper,
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 1,
            p: 1,
            boxShadow: theme.shadows[4],
          }}
        >
          <Typography variant="body2" color="text.primary">
            {data.name}: {data.value}%
          </Typography>
        </Box>
      );
    }
    return null;
  };

  const CustomLegend = ({ payload }: any) => (
    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3, mt: 2 }}>
      {payload.map((entry: any, index: number) => (
        <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box 
            sx={{ 
              width: 12, 
              height: 12, 
              bgcolor: entry.color, 
              borderRadius: '50%' 
            }} 
          />
          <Typography variant="caption">{entry.value}</Typography>
        </Box>
      ))}
    </Box>
  );

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Compliance Breakdown
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Filing performance over last 12 months
        </Typography>
        <Box sx={{ width: '100%', height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </Box>
        <CustomLegend 
          payload={data.map(item => ({ 
            value: item.name, 
            color: item.color 
          }))} 
        />
        <Box sx={{ textAlign: 'center', mt: 2 }}>
          <Typography variant="h4" color="success.main">
            92%
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Overall Score
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};