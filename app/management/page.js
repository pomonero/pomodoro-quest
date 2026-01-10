'use client';

import dynamic from 'next/dynamic';

// Client-side only
const AdminPanel = dynamic(() => import('@/components/AdminPanel'), { ssr: false });

export default function AdminPage() {
  return <AdminPanel />;
}
