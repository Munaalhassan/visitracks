import { useParams } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { VisitorsTable } from '@/components/visitors/VisitorsTable';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useVisitors } from '@/hooks/useVisitors';
import { useSessions } from '@/hooks/useSessions';
import { format } from 'date-fns';
import { CalendarDays, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function SessionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { sessions } = useSessions();
  const { visitors } = useVisitors(id);

  const session = sessions.find(s => s.id === id);

  if (!session) {
    return (
      <Layout>
        <div className="text-center py-8">
          <p className="text-muted-foreground">Session not found</p>
          <Button asChild className="mt-4">
            <Link to="/sessions">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Sessions
            </Link>
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" asChild>
            <Link to="/sessions">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">
              {format(new Date(session.session_date), 'EEEE, MMMM d, yyyy')}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-muted-foreground">
                Started: {format(new Date(session.started_at), 'HH:mm')}
                {session.ended_at && ` • Ended: ${format(new Date(session.ended_at), 'HH:mm')}`}
              </span>
              {session.is_active ? (
                <Badge className="bg-green-100 text-green-800">Active</Badge>
              ) : (
                <Badge variant="secondary">Ended</Badge>
              )}
            </div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5" />
              Visitor Log ({visitors.length} visitors)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <VisitorsTable visitors={visitors} showActions={session.is_active} />
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
