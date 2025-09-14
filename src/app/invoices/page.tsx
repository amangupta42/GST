'use client';

import { DashboardLayout } from '@/components/layouts';
import { InvoiceManagementSystem } from './components/InvoiceManagementSystem';

export default function InvoicesPage() {
  return (
    <DashboardLayout>
      <InvoiceManagementSystem />
    </DashboardLayout>
  );
}