import { Layout } from '@/components/layout/Layout';
import { HostsList } from '@/components/hosts/HostsList';

export default function HostsPage() {
  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Host Directory</h1>
          <p className="text-muted-foreground">Manage employees who can receive visitors</p>
        </div>

        <HostsList />
      </div>
    </Layout>
  );
}
