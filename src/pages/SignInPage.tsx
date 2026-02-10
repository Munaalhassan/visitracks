import { Layout } from '@/components/layout/Layout';
import { VisitorSignInForm } from '@/components/visitors/VisitorSignInForm';
import { VisitorsTable } from '@/components/visitors/VisitorsTable';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useVisitors } from '@/hooks/useVisitors';
import { useSessions } from '@/hooks/useSessions';
import { Users } from 'lucide-react';

export default function SignInPage() {
  const { activeSession } = useSessions();
  const { visitors } = useVisitors(activeSession?.id);

  // Filter to show only visitors still in premises
  const currentVisitors = visitors.filter(v => !v.time_out);

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Sign In Visitor</h1>
          <p className="text-muted-foreground">Register new visitors arriving at the premises</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <VisitorSignInForm />

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Currently In Premises ({currentVisitors.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {currentVisitors.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No visitors currently in premises
                </div>
              ) : (
                <div className="space-y-3">
                  {currentVisitors.slice(0, 5).map((visitor) => (
                    <div key={visitor.id} className="flex items-center justify-between border-b pb-2 last:border-0">
                      <div>
                        <p className="font-medium">{visitor.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Visiting: {visitor.hosts?.name || visitor.host_name || 'N/A'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
