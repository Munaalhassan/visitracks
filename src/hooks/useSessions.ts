import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AttendanceSession } from '@/types/visitor';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { useBuilding } from '@/contexts/BuildingContext';

export function useSessions() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { currentBuilding } = useBuilding();

  const sessionsQuery = useQuery({
    queryKey: ['sessions', currentBuilding?.id],
    queryFn: async () => {
      if (!currentBuilding) return [];
      const { data, error } = await supabase
        .from('attendance_sessions')
        .select('*')
        .eq('building_id', currentBuilding.id)
        .order('session_date', { ascending: false });
      if (error) throw error;
      return data as AttendanceSession[];
    },
    enabled: !!currentBuilding,
  });

  const activeSessionQuery = useQuery({
    queryKey: ['sessions', 'active', currentBuilding?.id],
    queryFn: async () => {
      if (!currentBuilding) return null;
      const { data, error } = await supabase
        .from('attendance_sessions')
        .select('*')
        .eq('building_id', currentBuilding.id)
        .eq('is_active', true)
        .maybeSingle();
      if (error) throw error;
      return data as AttendanceSession | null;
    },
    enabled: !!currentBuilding,
  });

  const todaySessionQuery = useQuery({
    queryKey: ['sessions', 'today', currentBuilding?.id],
    queryFn: async () => {
      if (!currentBuilding) return null;
      const today = format(new Date(), 'yyyy-MM-dd');
      const { data, error } = await supabase
        .from('attendance_sessions')
        .select('*')
        .eq('building_id', currentBuilding.id)
        .eq('session_date', today)
        .maybeSingle();
      if (error) throw error;
      return data as AttendanceSession | null;
    },
    enabled: !!currentBuilding,
  });

  const createSession = useMutation({
    mutationFn: async (date: Date) => {
      if (!currentBuilding) throw new Error('No building selected');
      const sessionDate = format(date, 'yyyy-MM-dd');
      const { data, error } = await supabase
        .from('attendance_sessions')
        .insert({ 
          session_date: sessionDate, 
          is_active: true,
          building_id: currentBuilding.id 
        })
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

  const reopenSession = useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from('attendance_sessions')
        .update({ is_active: true, ended_at: null })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      toast({ title: 'Session reopened successfully' });
    },
    onError: (error) => {
      toast({ title: 'Error reopening session', description: error.message, variant: 'destructive' });
    },
  });

  return {
    sessions: sessionsQuery.data ?? [],
    activeSession: activeSessionQuery.data,
    todaySession: todaySessionQuery.data,
    isLoading: sessionsQuery.isLoading,
    createSession,
    endSession,
    reopenSession,
  };
}
