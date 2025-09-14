'use client';

import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layouts';
import { GSTR3BWizard } from './components/GSTR3BWizard';

export default function GSTR3BFiling() {
  const router = useRouter();

  const handleComplete = () => {
    // Navigate back to dashboard or filing overview
    router.push('/dashboard');
  };

  return (
    <DashboardLayout>
      <GSTR3BWizard onComplete={handleComplete} />
    </DashboardLayout>
  );
}