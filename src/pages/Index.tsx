import { Layout } from '@/components/layout/Layout';
import { StatsCards } from '@/components/dashboard/StatsCards';
import { VisitorCharts } from '@/components/dashboard/VisitorCharts';
import { SessionManager } from '@/components/sessions/SessionManager';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useDashboard } from '@/hooks/useDashboard';
import { format } from 'date-fns';
import { Clock } from 'lucide-react';

const Index = () => {
  const { stats, categoryStats, weeklyTrend, recentVisitors, isLoading } = useDashboard();

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Welcome to VisiTrack - Visitor Management System</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-4">
          <div className="lg:col-span-3">
            <StatsCards
              todayVisitors={stats?.todayVisitors ?? 0}
              currentlyIn={stats?.currentlyIn ?? 0}
              weekVisitors={stats?.weekVisitors ?? 0}
              activeHosts={stats?.activeHosts ?? 0}
            />
          </div>
          <div>
            <SessionManager />
          </div>
        </div>

        <VisitorCharts weeklyTrend={weeklyTrend} categoryStats={categoryStats} />

        <Card>
          <CardHeader>
            <CardTitle>Recent Visitors</CardTitle>
          </CardHeader>
          <CardContent>
            {recentVisitors.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No visitors yet. Start a session and sign in your first visitor!
              </div>
            ) : (
              <div className="space-y-4">
                {recentVisitors.map((visitor) => (
                  <div key={visitor.id} className="flex items-center justify-between border-b pb-4 last:border-0">
                    <div>
                      <p className="font-medium">{visitor.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Visiting: {visitor.hosts?.name || 'N/A'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm">{format(new Date(visitor.time_in), 'MMM d, HH:mm')}</p>
                      {visitor.time_out ? (
                        <Badge variant="secondary">Left</Badge>
                      ) : (
                        <Badge className="bg-green-100 text-green-800">
                          <Clock className="h-3 w-3 mr-1" />
                          In premises
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Index;
