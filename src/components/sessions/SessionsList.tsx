import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useSessions } from '@/hooks/useSessions';
import { CalendarDays, RotateCcw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export function SessionsList() {
  const { sessions, isLoading, reopenSession, activeSession } = useSessions();

  if (isLoading) {
    return <div>Loading sessions...</div>;
  }

  const handleReopenSession = (sessionId: string) => {
    reopenSession.mutate(sessionId);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarDays className="h-5 w-5" />
          All Sessions
        </CardTitle>
      </CardHeader>
      <CardContent>
        {sessions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No sessions yet. Start your first session to begin.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Started</TableHead>
                <TableHead>Ended</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sessions.map((session) => (
                <TableRow key={session.id}>
                  <TableCell className="font-medium">
                    {format(new Date(session.session_date), 'EEEE, MMM d, yyyy')}
                  </TableCell>
                  <TableCell>{format(new Date(session.started_at), 'HH:mm')}</TableCell>
                  <TableCell>
                    {session.ended_at ? format(new Date(session.ended_at), 'HH:mm') : '-'}
                  </TableCell>
                  <TableCell>
                    {session.is_active ? (
                      <Badge className="bg-green-100 text-green-800">Active</Badge>
                    ) : (
                      <Badge variant="secondary">Ended</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link to={`/session/${session.id}`}>View Log</Link>
                      </Button>
                      {!session.is_active && !activeSession && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleReopenSession(session.id)}
                          disabled={reopenSession.isPending}
                        >
                          <RotateCcw className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
