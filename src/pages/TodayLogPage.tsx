import { Layout } from '@/components/layout/Layout';
import { VisitorsTable } from '@/components/visitors/VisitorsTable';
import { SessionManager } from '@/components/sessions/SessionManager';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useVisitors } from '@/hooks/useVisitors';
import { useSessions } from '@/hooks/useSessions';
import { format } from 'date-fns';
import { CalendarDays, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function TodayLogPage() {
  const { activeSession, todaySession } = useSessions();
  const currentSession = activeSession || todaySession;
  const { visitors } = useVisitors(currentSession?.id);

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Today's Visitor Log</h1>
          <p className="text-muted-foreground">
            {currentSession 
              ? format(new Date(currentSession.session_date), 'EEEE, MMMM d, yyyy')
              : 'No active session'
            }
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-4">
          <div className="lg:col-span-3">
            {!currentSession ? (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  No session for today. Start a new session from the control panel to begin recording visitors.
                </AlertDescription>
              </Alert>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CalendarDays className="h-5 w-5" />
                    Visitors ({visitors.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <VisitorsTable visitors={visitors} showActions={true} />
                </CardContent>
              </Card>
            )}
          </div>
          <div>
            <SessionManager />
          </div>
        </div>
      </div>
    </Layout>
  );
}
