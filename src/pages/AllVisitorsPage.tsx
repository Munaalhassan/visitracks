import { Layout } from '@/components/layout/Layout';
import { VisitorsTable } from '@/components/visitors/VisitorsTable';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useVisitors } from '@/hooks/useVisitors';
import { Users } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function AllVisitorsPage() {
  const { allVisitors, isLoading } = useVisitors();

  const inPremises = allVisitors.filter(v => !v.time_out);
  const signedOut = allVisitors.filter(v => !!v.time_out);

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">All Visitors</h1>
          <p className="text-muted-foreground">
            View all visitors across all sessions. Sign out visitors who were not logged out.
          </p>
        </div>

        <Tabs defaultValue="in-premises">
          <TabsList>
            <TabsTrigger value="in-premises">
              In Premises ({inPremises.length})
            </TabsTrigger>
            <TabsTrigger value="all">
              All ({allVisitors.length})
            </TabsTrigger>
            <TabsTrigger value="signed-out">
              Signed Out ({signedOut.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="in-premises">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Currently In Premises
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-8">Loading...</div>
                ) : (
                  <VisitorsTable visitors={inPremises} showActions={true} />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="all">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  All Visitors
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-8">Loading...</div>
                ) : (
                  <VisitorsTable visitors={allVisitors} showActions={true} />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="signed-out">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Signed Out Visitors
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-8">Loading...</div>
                ) : (
                  <VisitorsTable visitors={signedOut} showActions={false} />
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
