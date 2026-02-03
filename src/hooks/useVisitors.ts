import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Visitor, VisitorCategory } from '@/types/visitor';
import { useToast } from '@/hooks/use-toast';
import { useBuilding } from '@/contexts/BuildingContext';

interface CreateVisitorData {
  session_id: string;
  host_id?: string | null;
  name: string;
  company?: string | null;
  phone?: string | null;
  email?: string | null;
  category: VisitorCategory;
  purpose?: string | null;
  badge_number?: string | null;
  remarks?: string | null;
}

export function useVisitors(sessionId?: string) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { currentBuilding } = useBuilding();

  const visitorsQuery = useQuery({
    queryKey: ['visitors', sessionId, currentBuilding?.id],
    queryFn: async () => {
      if (!currentBuilding) return [];
      let query = supabase
        .from('visitors')
        .select('*, hosts(*)')
        .eq('building_id', currentBuilding.id)
        .order('time_in', { ascending: false });
      
      if (sessionId) {
        query = query.eq('session_id', sessionId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as Visitor[];
    },
    enabled: sessionId !== undefined && !!currentBuilding,
  });

  const allVisitorsQuery = useQuery({
    queryKey: ['visitors', 'all', currentBuilding?.id],
    queryFn: async () => {
      if (!currentBuilding) return [];
      const { data, error } = await supabase
        .from('visitors')
        .select('*, hosts(*)')
        .eq('building_id', currentBuilding.id)
        .order('time_in', { ascending: false });
      if (error) throw error;
      return data as Visitor[];
    },
    enabled: !!currentBuilding,
  });

  const createVisitor = useMutation({
    mutationFn: async (visitor: CreateVisitorData) => {
      if (!currentBuilding) throw new Error('No building selected');
      const { data, error } = await supabase
        .from('visitors')
        .insert({ ...visitor, building_id: currentBuilding.id })
        .select('*, hosts(*)')
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['visitors'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast({ title: 'Visitor signed in successfully' });
    },
    onError: (error) => {
      toast({ title: 'Error signing in visitor', description: error.message, variant: 'destructive' });
    },
  });

  const signOutVisitor = useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from('visitors')
        .update({ time_out: new Date().toISOString() })
        .eq('id', id)
        .select('*, hosts(*)')
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['visitors'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast({ title: 'Visitor signed out successfully' });
    },
    onError: (error) => {
      toast({ title: 'Error signing out visitor', description: error.message, variant: 'destructive' });
    },
  });

  const verifySignature = useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from('visitors')
        .update({ signature_verified: true })
        .eq('id', id)
        .select('*, hosts(*)')
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['visitors'] });
      toast({ title: 'Signature verified' });
    },
    onError: (error) => {
      toast({ title: 'Error verifying signature', description: error.message, variant: 'destructive' });
    },
  });

  const updateVisitor = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Visitor> & { id: string }) => {
      const { data, error } = await supabase
        .from('visitors')
        .update(updates)
        .eq('id', id)
        .select('*, hosts(*)')
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['visitors'] });
      toast({ title: 'Visitor updated successfully' });
    },
    onError: (error) => {
      toast({ title: 'Error updating visitor', description: error.message, variant: 'destructive' });
    },
  });

  return {
    visitors: visitorsQuery.data ?? [],
    allVisitors: allVisitorsQuery.data ?? [],
    isLoading: visitorsQuery.isLoading || allVisitorsQuery.isLoading,
    createVisitor,
    signOutVisitor,
    verifySignature,
    updateVisitor,
  };
}
