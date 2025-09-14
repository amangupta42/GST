'use client';

import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layouts';
import { GSTR9Wizard } from './components/GSTR9Wizard';

export default function GSTR9Filing() {
  const router = useRouter();

  const handleComplete = () => {
    // Navigate back to dashboard or filing overview
    router.push('/dashboard');
  };

  return (
    <DashboardLayout>
      <GSTR9Wizard onComplete={handleComplete} />
    </DashboardLayout>
  );
}