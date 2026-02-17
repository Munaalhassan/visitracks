import { useState, useMemo } from 'react';
import { Layout } from '@/components/layout/Layout';
import { VisitorsTable } from '@/components/visitors/VisitorsTable';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useVisitors } from '@/hooks/useVisitors';
import { useHosts } from '@/hooks/useHosts';
import { VISITOR_CATEGORIES } from '@/types/visitor';
import { Search, CalendarIcon, X } from 'lucide-react';
import { format, isWithinInterval, startOfDay, endOfDay } from 'date-fns';
import { cn } from '@/lib/utils';
import { DateRange } from 'react-day-picker';

export default function SearchPage() {
  const { allVisitors, isLoading } = useVisitors();
  const { hosts } = useHosts();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedHost, setSelectedHost] = useState<string>('all');
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  const filteredVisitors = useMemo(() => {
    return allVisitors.filter((visitor) => {
      // Search term filter
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        const matchesSearch = 
          visitor.name.toLowerCase().includes(search) ||
          visitor.company?.toLowerCase().includes(search) ||
          visitor.phone?.includes(search) ||
          visitor.email?.toLowerCase().includes(search) ||
          visitor.hosts?.name?.toLowerCase().includes(search);
        if (!matchesSearch) return false;
      }

      // Category filter
      if (selectedCategory && selectedCategory !== 'all' && visitor.category !== selectedCategory) {
        return false;
      }

      // Host filter
      if (selectedHost && selectedHost !== 'all' && visitor.host_id !== selectedHost) {
        return false;
      }

      // Date range filter
      if (dateRange?.from) {
        const visitorDate = new Date(visitor.time_in);
        const from = startOfDay(dateRange.from);
        const to = dateRange.to ? endOfDay(dateRange.to) : endOfDay(dateRange.from);
        if (!isWithinInterval(visitorDate, { start: from, end: to })) {
          return false;
        }
      }

      return true;
    });
  }, [allVisitors, searchTerm, selectedCategory, selectedHost, dateRange]);

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setSelectedHost('all');
    setDateRange(undefined);
  };

  const hasActiveFilters = searchTerm || (selectedCategory && selectedCategory !== 'all') || (selectedHost && selectedHost !== 'all') || dateRange;

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Search Visitors</h1>
          <p className="text-muted-foreground">Search and filter through all visitor records</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Search & Filter
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
              <div className="lg:col-span-2">
                <Input
                  placeholder="Search by name, company, phone, email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>

              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  <SelectItem value="all">All Categories</SelectItem>
                  {VISITOR_CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedHost} onValueChange={setSelectedHost}>
                <SelectTrigger>
                  <SelectValue placeholder="All Hosts" />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  <SelectItem value="all">All Hosts</SelectItem>
                  {hosts.map((host) => (
                    <SelectItem key={host.id} value={host.id}>
                      {host.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="justify-start">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange?.from ? (
                      dateRange.to ? (
                        `${format(dateRange.from, 'MMM d')} - ${format(dateRange.to, 'MMM d')}`
                      ) : (
                        format(dateRange.from, 'MMM d, yyyy')
                      )
                    ) : (
                      'Date Range'
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-popover" align="start">
                  <Calendar
                    mode="range"
                    selected={dateRange}
                    onSelect={setDateRange}
                    numberOfMonths={2}
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {hasActiveFilters && (
              <div className="mt-4 flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  Showing {filteredVisitors.length} of {allVisitors.length} visitors
                </span>
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  <X className="h-4 w-4 mr-1" />
                  Clear Filters
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Results ({filteredVisitors.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">Loading...</div>
            ) : (
              <VisitorsTable visitors={filteredVisitors} showActions={false} />
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
