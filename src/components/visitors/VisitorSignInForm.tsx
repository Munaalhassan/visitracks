import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useHosts } from '@/hooks/useHosts';
import { useVisitors } from '@/hooks/useVisitors';
import { useSessions } from '@/hooks/useSessions';
import { VISITOR_CATEGORIES, VisitorCategory } from '@/types/visitor';
import { UserPlus, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const formSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  company: z.string().max(100).optional(),
  phone: z.string().max(20).optional(),
  email: z.string().email('Invalid email').max(255).optional().or(z.literal('')),
  host_id: z.string().optional(),
  category: z.enum(['guest', 'contractor', 'delivery', 'interview', 'vendor', 'other']),
  purpose: z.string().max(500).optional(),
  badge_number: z.string().max(20).optional(),
  remarks: z.string().max(500).optional(),
});

type FormData = z.infer<typeof formSchema>;

export function VisitorSignInForm() {
  const { activeHosts } = useHosts();
  const { createVisitor } = useVisitors();
  const { activeSession } = useSessions();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      company: '',
      phone: '',
      email: '',
      host_id: '',
      category: 'guest',
      purpose: '',
      badge_number: '',
      remarks: '',
    },
  });

  const onSubmit = async (data: FormData) => {
    if (!activeSession) return;

    await createVisitor.mutateAsync({
      session_id: activeSession.id,
      name: data.name,
      company: data.company || null,
      phone: data.phone || null,
      email: data.email || null,
      host_id: data.host_id || null,
      category: data.category as VisitorCategory,
      purpose: data.purpose || null,
      badge_number: data.badge_number || null,
      remarks: data.remarks || null,
    });

    form.reset();
  };

  if (!activeSession) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          No active attendance session. Please start a session first from the Sessions page.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserPlus className="h-5 w-5" />
          Sign In New Visitor
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Visitor Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter visitor's full name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="company"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company</FormLabel>
                    <FormControl>
                      <Input placeholder="Visitor's company" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input placeholder="Phone number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="Email address" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="host_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Visiting (Host)</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select host" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-popover">
                        {activeHosts.map((host) => (
                          <SelectItem key={host.id} value={host.id}>
                            {host.name} {host.department && `(${host.department})`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-popover">
                        {VISITOR_CATEGORIES.map((cat) => (
                          <SelectItem key={cat.value} value={cat.value}>
                            {cat.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="badge_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Badge Number</FormLabel>
                    <FormControl>
                      <Input placeholder="Visitor badge #" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="purpose"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Purpose of Visit</FormLabel>
                    <FormControl>
                      <Input placeholder="Meeting, delivery, etc." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="remarks"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Remarks</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Additional notes..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={createVisitor.isPending}>
              {createVisitor.isPending ? 'Signing In...' : 'Sign In Visitor'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
