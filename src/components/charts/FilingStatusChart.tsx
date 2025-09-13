'use client';

import { Card, CardContent, Typography, Box, useTheme } from '@mui/material';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAppSelector } from '@/store';
import { selectChartData } from '@/store/slices/dashboardSlice';

export const FilingStatusChart = () => {
  const theme = useTheme();
  const chartData = useAppSelector(selectChartData);
  const data = chartData.filingStatus;

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Filing Status Timeline
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Monthly filing completion status
        </Typography>
        <Box sx={{ width: '100%', height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
              <XAxis 
                dataKey="month" 
                stroke={theme.palette.text.secondary}
                fontSize={12}
              />
              <YAxis 
                stroke={theme.palette.text.secondary}
                fontSize={12}
                domain={[0, 3]}
                ticks={[0, 1, 2, 3]}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: theme.palette.background.paper,
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: 8,
                }}
                labelStyle={{ color: theme.palette.text.primary }}
                formatter={(value: number, name: string) => [
                  value ? 'Filed' : 'Pending',
                  name === 'gstr1' ? 'GSTR-1' : name === 'gstr3b' ? 'GSTR-3B' : 'GSTR-9'
                ]}
              />
              <Area
                type="monotone"
                dataKey="gstr1"
                stackId="1"
                stroke={theme.palette.primary.main}
                fill={theme.palette.primary.light}
                fillOpacity={0.8}
              />
              <Area
                type="monotone"
                dataKey="gstr3b"
                stackId="1"
                stroke={theme.palette.success.main}
                fill={theme.palette.success.light}
                fillOpacity={0.8}
              />
              <Area
                type="monotone"
                dataKey="gstr9"
                stackId="1"
                stroke={theme.palette.warning.main}
                fill={theme.palette.warning.light}
                fillOpacity={0.8}
              />
            </AreaChart>
          </ResponsiveContainer>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 4, mt: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 12, height: 12, bgcolor: 'primary.main', borderRadius: 1 }} />
            <Typography variant="caption">GSTR-1</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 12, height: 12, bgcolor: 'success.main', borderRadius: 1 }} />
            <Typography variant="caption">GSTR-3B</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 12, height: 12, bgcolor: 'warning.main', borderRadius: 1 }} />
            <Typography variant="caption">GSTR-9</Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};