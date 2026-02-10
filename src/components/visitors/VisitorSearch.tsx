import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Search, UserPlus, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useBuilding } from '@/contexts/BuildingContext';
import { Visitor } from '@/types/visitor';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface VisitorSearchProps {
  onSelectVisitor: (visitor: Visitor) => void;
  onNewVisitor: () => void;
}

export function VisitorSearch({ onSelectVisitor, onNewVisitor }: VisitorSearchProps) {
  const { currentBuilding } = useBuilding();
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<Visitor[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async () => {
    if (!searchTerm.trim() || !currentBuilding) return;
    setIsSearching(true);
    setHasSearched(true);

    const { data, error } = await supabase
      .from('visitors')
      .select('*, hosts(*)')
      .eq('building_id', currentBuilding.id)
      .ilike('name', `%${searchTerm.trim()}%`)
      .order('time_in', { ascending: false })
      .limit(10);

    if (!error && data) {
      // Deduplicate by name — keep most recent entry per unique name
      const seen = new Map<string, Visitor>();
      for (const v of data as Visitor[]) {
        const key = v.name.toLowerCase();
        if (!seen.has(key)) seen.set(key, v);
      }
      setResults(Array.from(seen.values()));
    } else {
      setResults([]);
    }
    setIsSearching(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          placeholder="Search visitor by name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          className="flex-1"
        />
        <Button onClick={handleSearch} disabled={isSearching || !searchTerm.trim()}>
          <Search className="h-4 w-4 mr-1" />
          Search
        </Button>
      </div>

      {hasSearched && results.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Returning visitors found:</p>
          {results.map((visitor) => (
            <Card
              key={visitor.id}
              className="cursor-pointer hover:border-primary transition-colors"
              onClick={() => onSelectVisitor(visitor)}
            >
              <CardContent className="flex items-center gap-3 p-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={visitor.photo_url ?? undefined} />
                  <AvatarFallback>
                    <User className="h-5 w-5" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{visitor.name}</p>
                  <p className="text-sm text-muted-foreground truncate">
                    {visitor.company || 'No company'} • Last visited: {new Date(visitor.time_in).toLocaleDateString()}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {hasSearched && results.length === 0 && !isSearching && (
        <p className="text-sm text-muted-foreground">No returning visitor found.</p>
      )}

      <Button variant="outline" className="w-full" onClick={onNewVisitor}>
        <UserPlus className="h-4 w-4 mr-1" />
        {hasSearched ? 'Sign In as New Visitor' : 'Skip Search — New Visitor'}
      </Button>
    </div>
  );
}
