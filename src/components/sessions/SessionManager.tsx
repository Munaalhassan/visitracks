import { useState } from 'react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useSessions } from '@/hooks/useSessions';
import { CalendarIcon, Play, Square, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

export function SessionManager() {
  const { activeSession, todaySession, createSession, endSession } = useSessions();
  const [date, setDate] = useState<Date>(new Date());
  const [calendarOpen, setCalendarOpen] = useState(false);

  const handleStartSession = () => {
    createSession.mutate(date);
    setCalendarOpen(false);
  };

  const handleEndSession = () => {
    if (activeSession) {
      endSession.mutate(activeSession.id);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Session Control
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {activeSession ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge className="bg-green-100 text-green-800">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse" />
                Active Session
              </Badge>
            </div>
            <div className="text-sm text-muted-foreground">
              <p>Date: <span className="font-medium text-foreground">{format(new Date(activeSession.session_date), 'EEEE, MMMM d, yyyy')}</span></p>
              <p>Started: <span className="font-medium text-foreground">{format(new Date(activeSession.started_at), 'HH:mm')}</span></p>
            </div>
            <Button 
              variant="destructive" 
              onClick={handleEndSession}
              disabled={endSession.isPending}
              className="w-full"
            >
              <Square className="h-4 w-4 mr-2" />
              End Today's Session
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {todaySession && !todaySession.is_active ? (
              <div className="text-sm text-muted-foreground">
                Today's session has already ended at {format(new Date(todaySession.ended_at!), 'HH:mm')}
              </div>
            ) : (
              <>
                <div className="text-sm text-muted-foreground">
                  No active session. Start one to begin recording visitors.
                </div>
                <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, 'PPP') : 'Pick a date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-popover" align="start">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={(d) => d && setDate(d)}
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
                <Button 
                  onClick={handleStartSession}
                  disabled={createSession.isPending}
                  className="w-full"
                >
                  <Play className="h-4 w-4 mr-2" />
                  Start Attendance Session
                </Button>
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
