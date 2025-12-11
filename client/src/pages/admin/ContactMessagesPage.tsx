import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getQueryFn, apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

// UI Components
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';

export default function ContactMessagesPage() {
  const [selectedMessage, setSelectedMessage] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Fetch contact messages
  const { data, isLoading } = useQuery<{ success: boolean; data: any[] }>({
    queryKey: ['/api/admin/contact'],
    queryFn: getQueryFn({ 
      on401: 'returnNull'
    }),
    refetchOnWindowFocus: false,
  });
  
  // Mark message as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: async (id: number) => {
      const apiKey = localStorage.getItem('cms-api-key');
      const response = await apiRequest('PATCH', `/api/admin/contact/${id}/read`);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/contact'] });
      toast({
        title: 'Message marked as read',
        description: 'The contact message has been marked as read.',
      });
    },
    onError: () => {
      toast({
        variant: 'destructive',
        title: 'Failed to mark message as read',
        description: 'An error occurred while marking the message as read.',
      });
    },
  });
  
  const messages = data?.data || [];
  
  const handleMessageClick = (message: any) => {
    setSelectedMessage(message);
    
    // If message is unread, mark it as read
    if (!message.is_read) {
      markAsReadMutation.mutate(message.id);
    }
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Contact Messages</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Contact Form Submissions</CardTitle>
          <CardDescription>
            View and manage messages submitted through the contact form
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-40">
              <p className="text-gray-500">Loading messages...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex items-center justify-center h-40 bg-gray-100 rounded-md">
              <p className="text-gray-500">No contact messages found</p>
            </div>
          ) : (
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">Status</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead className="w-[140px]">Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {messages.map((message: any) => (
                    <TableRow 
                      key={message.id}
                      className={!message.is_read ? 'bg-primary/5 hover:bg-primary/10 cursor-pointer' : 'hover:bg-gray-100 cursor-pointer'}
                      onClick={() => handleMessageClick(message)}
                    >
                      <TableCell>
                        {message.is_read ? (
                          <Badge variant="outline" className="bg-gray-100">Read</Badge>
                        ) : (
                          <Badge>New</Badge>
                        )}
                      </TableCell>
                      <TableCell className="font-medium">{message.name}</TableCell>
                      <TableCell>{message.email}</TableCell>
                      <TableCell>{message.subject}</TableCell>
                      <TableCell>{formatDate(message.created_at)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Message Detail Dialog */}
      <Dialog open={!!selectedMessage} onOpenChange={(open) => !open && setSelectedMessage(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{selectedMessage?.subject}</DialogTitle>
            <DialogDescription>
              From {selectedMessage?.name} ({selectedMessage?.email})
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            {selectedMessage?.company && (
              <div>
                <h4 className="text-sm font-medium text-gray-500">Company</h4>
                <p>{selectedMessage.company}</p>
              </div>
            )}
            <div>
              <h4 className="text-sm font-medium text-gray-500">Message</h4>
              <p className="mt-1 whitespace-pre-line">{selectedMessage?.message}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500">Received</h4>
              <p className="text-sm">{selectedMessage?.created_at && formatDate(selectedMessage.created_at)}</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}