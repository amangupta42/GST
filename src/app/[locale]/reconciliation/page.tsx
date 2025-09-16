'use client';

import { DashboardLayout } from '@/components/layouts';
import { ITCReconciliationEngine } from './components/ITCReconciliationEngine';

export default function ReconciliationPage() {
  return (
    <DashboardLayout>
      <ITCReconciliationEngine />
    </DashboardLayout>
  );
}