import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AttendanceSession } from '@/types/visitor';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

export function useSessions() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const sessionsQuery = useQuery({
    queryKey: ['sessions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('attendance_sessions')
        .select('*')
        .order('session_date', { ascending: false });
      if (error) throw error;
      return data as AttendanceSession[];
    },
  });

  const activeSessionQuery = useQuery({
    queryKey: ['sessions', 'active'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('attendance_sessions')
        .select('*')
        .eq('is_active', true)
        .maybeSingle();
      if (error) throw error;
      return data as AttendanceSession | null;
    },
  });

  const todaySessionQuery = useQuery({
    queryKey: ['sessions', 'today'],
    queryFn: async () => {
      const today = format(new Date(), 'yyyy-MM-dd');
      const { data, error } = await supabase
        .from('attendance_sessions')
        .select('*')
        .eq('session_date', today)
        .maybeSingle();
      if (error) throw error;
      return data as AttendanceSession | null;
    },
  });

  const createSession = useMutation({
    mutationFn: async (date: Date) => {
      const sessionDate = format(date, 'yyyy-MM-dd');
      const { data, error } = await supabase
        .from('attendance_sessions')
        .insert({ session_date: sessionDate, is_active: true })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      toast({ title: 'Attendance session started' });
    },
    onError: (error) => {
      toast({ title: 'Error starting session', description: error.message, variant: 'destructive' });
    },
  });

  const endSession = useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from('attendance_sessions')
        .update({ is_active: false, ended_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      toast({ title: 'Attendance session ended' });
    },
    onError: (error) => {
      toast({ title: 'Error ending session', description: error.message, variant: 'destructive' });
    },
  });

  return {
    sessions: sessionsQuery.data ?? [],
    activeSession: activeSessionQuery.data,
    todaySession: todaySessionQuery.data,
    isLoading: sessionsQuery.isLoading,
    createSession,
    endSession,
  };
}
