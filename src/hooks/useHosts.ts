import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Host } from '@/types/visitor';
import { useToast } from '@/hooks/use-toast';

export function useHosts() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const hostsQuery = useQuery({
    queryKey: ['hosts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('hosts')
        .select('*')
        .order('name');
      if (error) throw error;
      return data as Host[];
    },
  });

  const activeHostsQuery = useQuery({
    queryKey: ['hosts', 'active'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('hosts')
        .select('*')
        .eq('is_active', true)
        .order('name');
      if (error) throw error;
      return data as Host[];
    },
  });

  const createHost = useMutation({
    mutationFn: async (host: Omit<Host, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('hosts')
        .insert(host)
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
