import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Host } from '@/types/visitor';
import { useToast } from '@/hooks/use-toast';
import { useBuilding } from '@/contexts/BuildingContext';

export function useHosts() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { currentBuilding } = useBuilding();

  const hostsQuery = useQuery({
    queryKey: ['hosts', currentBuilding?.id],
    queryFn: async () => {
      if (!currentBuilding) return [];
      const { data, error } = await supabase
        .from('hosts')
        .select('*')
        .eq('building_id', currentBuilding.id)
        .order('name');
      if (error) throw error;
      return data as Host[];
    },
    enabled: !!currentBuilding,
  });

  const activeHostsQuery = useQuery({
    queryKey: ['hosts', 'active', currentBuilding?.id],
    queryFn: async () => {
      if (!currentBuilding) return [];
      const { data, error } = await supabase
        .from('hosts')
        .select('*')
        .eq('building_id', currentBuilding.id)
        .eq('is_active', true)
        .order('name');
      if (error) throw error;
      return data as Host[];
    },
    enabled: !!currentBuilding,
  });

  const createHost = useMutation({
    mutationFn: async (host: Omit<Host, 'id' | 'created_at' | 'updated_at' | 'building_id'>) => {
      if (!currentBuilding) throw new Error('No building selected');
      const { data, error } = await supabase
        .from('hosts')
        .insert({ ...host, building_id: currentBuilding.id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hosts'] });
      toast({ title: 'Host added successfully' });
    },
    onError: (error) => {
      toast({ title: 'Error adding host', description: error.message, variant: 'destructive' });
    },
  });

  const updateHost = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Host> & { id: string }) => {
      const { data, error } = await supabase
        .from('hosts')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hosts'] });
      toast({ title: 'Host updated successfully' });
    },
    onError: (error) => {
      toast({ title: 'Error updating host', description: error.message, variant: 'destructive' });
    },
  });

  const deleteHost = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('hosts').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hosts'] });
      toast({ title: 'Host deleted successfully' });
    },
    onError: (error) => {
      toast({ title: 'Error deleting host', description: error.message, variant: 'destructive' });
    },
  });

  return {
    hosts: hostsQuery.data ?? [],
    activeHosts: activeHostsQuery.data ?? [],
    isLoading: hostsQuery.isLoading,
    createHost,
    updateHost,
    deleteHost,
  };
}
