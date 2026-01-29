import { Layout } from '@/components/layout/Layout';
import { SessionManager } from '@/components/sessions/SessionManager';
import { SessionsList } from '@/components/sessions/SessionsList';

export default function SessionsPage() {
  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Attendance Sessions</h1>
          <p className="text-muted-foreground">Manage daily attendance recording sessions</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div>
            <SessionManager />
          </div>
          <div className="lg:col-span-2">
            <SessionsList />
          </div>
        </div>
      </div>
    </Layout>
  );
}
