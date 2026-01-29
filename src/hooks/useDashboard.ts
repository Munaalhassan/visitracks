import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';

export function useDashboard() {
  const statsQuery = useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: async () => {
      const today = new Date();
      const todayStart = startOfDay(today).toISOString();
      const todayEnd = endOfDay(today).toISOString();

      // Today's visitors
      const { count: todayCount } = await supabase
        .from('visitors')
        .select('*', { count: 'exact', head: true })
        .gte('time_in', todayStart)
        .lte('time_in', todayEnd);

      // Currently signed in (no time_out)
      const { count: currentlyIn } = await supabase
        .from('visitors')
        .select('*', { count: 'exact', head: true })
        .is('time_out', null);

      // Total visitors this week
      const weekStart = startOfDay(subDays(today, 7)).toISOString();
      const { count: weekCount } = await supabase
        .from('visitors')
        .select('*', { count: 'exact', head: true })
        .gte('time_in', weekStart);

      // Total hosts
      const { count: hostCount } = await supabase
        .from('hosts')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);

      return {
        todayVisitors: todayCount ?? 0,
        currentlyIn: currentlyIn ?? 0,
        weekVisitors: weekCount ?? 0,
        activeHosts: hostCount ?? 0,
      };
    },
  });

  const categoryStatsQuery = useQuery({
    queryKey: ['dashboard', 'categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('visitors')
        .select('category');
      if (error) throw error;

      const counts: Record<string, number> = {};
      data.forEach((v) => {
        counts[v.category] = (counts[v.category] || 0) + 1;
      });

      return Object.entries(counts).map(([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        value,
      }));
    },
  });

  const weeklyTrendQuery = useQuery({
    queryKey: ['dashboard', 'weekly'],
    queryFn: async () => {
      const today = new Date();
      const days = [];

      for (let i = 6; i >= 0; i--) {
        const date = subDays(today, i);
        const dayStart = startOfDay(date).toISOString();
        const dayEnd = endOfDay(date).toISOString();

        const { count } = await supabase
          .from('visitors')
          .select('*', { count: 'exact', head: true })
          .gte('time_in', dayStart)
          .lte('time_in', dayEnd);

        days.push({
          name: format(date, 'EEE'),
          visitors: count ?? 0,
        });
      }

      return days;
    },
  });

  const recentVisitorsQuery = useQuery({
    queryKey: ['dashboard', 'recent'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('visitors')
        .select('*, hosts(*)')
        .order('time_in', { ascending: false })
        .limit(5);
      if (error) throw error;
      return data;
    },
  });

  return {
    stats: statsQuery.data,
    categoryStats: categoryStatsQuery.data ?? [],
    weeklyTrend: weeklyTrendQuery.data ?? [],
    recentVisitors: recentVisitorsQuery.data ?? [],
    isLoading: statsQuery.isLoading,
  };
}
