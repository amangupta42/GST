'use client';

import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layouts';
import { FilingWizard } from './components/FilingWizard';

export default function GSTR1Filing() {
  const router = useRouter();

  const handleComplete = () => {
    // Navigate back to dashboard or filing overview
    router.push('/dashboard');
  };

  return (
    <DashboardLayout>
      <FilingWizard onComplete={handleComplete} />
    </DashboardLayout>
  );
}