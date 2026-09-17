import { CrmLayout } from '@/components/layout/crm-layout';

export default function Layout({ children }: { children: React.ReactNode }) {
  return <CrmLayout>{children}</CrmLayout>;
}
