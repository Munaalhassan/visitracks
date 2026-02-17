import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Visitor } from '@/types/visitor';
import { useVisitors } from '@/hooks/useVisitors';
import { CheckCircle, LogOut, Clock, User } from 'lucide-react';

interface VisitorsTableProps {
  visitors: Visitor[];
  showActions?: boolean;
}

export function VisitorsTable({ visitors, showActions = true }: VisitorsTableProps) {
  const { signOutVisitor, verifySignature } = useVisitors();

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      guest: 'bg-blue-100 text-blue-800',
      contractor: 'bg-orange-100 text-orange-800',
      delivery: 'bg-green-100 text-green-800',
      interview: 'bg-purple-100 text-purple-800',
      vendor: 'bg-yellow-100 text-yellow-800',
      other: 'bg-gray-100 text-gray-800',
    };
    return colors[category] || colors.other;
  };

  if (visitors.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No visitors found
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Photo</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Company</TableHead>
            <TableHead>Visiting</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Time In</TableHead>
            <TableHead>Time Out</TableHead>
            <TableHead>Signature</TableHead>
            {showActions && <TableHead>Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {visitors.map((visitor) => (
            <TableRow key={visitor.id}>
              <TableCell>
                <Avatar className="h-10 w-10">
                  <AvatarImage src={visitor.photo_url ?? undefined} alt={visitor.name} />
                  <AvatarFallback>
                    <User className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
              </TableCell>
              <TableCell className="font-medium">{visitor.name}</TableCell>
              <TableCell>{visitor.company || '-'}</TableCell>
              <TableCell>{visitor.hosts?.name || visitor.host_name || '-'}</TableCell>
              <TableCell>
                <Badge className={getCategoryColor(visitor.category)}>
                  {visitor.category}
                </Badge>
              </TableCell>
              <TableCell>{format(new Date(visitor.time_in), 'HH:mm')}</TableCell>
              <TableCell>
                {visitor.time_out ? (
                  format(new Date(visitor.time_out), 'HH:mm')
                ) : (
                  <Badge variant="outline" className="text-amber-600">
                    <Clock className="h-3 w-3 mr-1" />
                    In premises
                  </Badge>
                )}
              </TableCell>
              <TableCell>
                {visitor.signature_verified ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  showActions && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => verifySignature.mutate(visitor.id)}
                      disabled={verifySignature.isPending}
                    >
                      Verify
                    </Button>
                  )
                )}
              </TableCell>
              {showActions && (
                <TableCell>
                  {!visitor.time_out && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => signOutVisitor.mutate(visitor.id)}
                      disabled={signOutVisitor.isPending}
                    >
                      <LogOut className="h-4 w-4 mr-1" />
                      Sign Out
                    </Button>
                  )}
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
