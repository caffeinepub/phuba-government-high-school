import { useState, useMemo } from 'react';
import { Mail, Loader2, Trash2, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import {
  useGetAllContactForms,
  useUpdateContactStatus,
  useDeleteContactForm,
  useIsCallerAdmin,
} from '../hooks/useQueries';
import { ContactForm, ContactStatus } from '../backend';
import { toast } from 'sonner';

export default function ContactInboxPage() {
  const { identity } = useInternetIdentity();
  const { data: isAdmin, isLoading: adminLoading } = useIsCallerAdmin();
  const { data: contactForms = [], isLoading: formsLoading } = useGetAllContactForms();
  const updateStatusMutation = useUpdateContactStatus();
  const deleteFormMutation = useDeleteContactForm();

  const [selectedForm, setSelectedForm] = useState<ContactForm | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredForms = useMemo(() => {
    if (statusFilter === 'all') return contactForms;
    return contactForms.filter((form) => {
      switch (statusFilter) {
        case 'new':
          return form.status === ContactStatus.new_;
        case 'read':
          return form.status === ContactStatus.read;
        case 'replied':
          return form.status === ContactStatus.replied;
        default:
          return true;
      }
    });
  }, [contactForms, statusFilter]);

  const handleViewMessage = async (form: ContactForm) => {
    setSelectedForm(form);
    setDialogOpen(true);

    // Mark as read if it's new
    if (form.status === ContactStatus.new_) {
      try {
        await updateStatusMutation.mutateAsync({ id: form.id, status: ContactStatus.read });
      } catch (error) {
        console.error('Failed to update status:', error);
      }
    }
  };

  const handleUpdateStatus = async (id: bigint, status: ContactStatus) => {
    try {
      await updateStatusMutation.mutateAsync({ id, status });
      toast.success('Status updated successfully');
    } catch (error) {
      console.error('Update error:', error);
      toast.error('Failed to update status');
    }
  };

  const handleDelete = async (id: bigint) => {
    if (!confirm('Are you sure you want to delete this message?')) return;
    try {
      await deleteFormMutation.mutateAsync(id);
      toast.success('Message deleted successfully');
      if (selectedForm?.id === id) {
        setDialogOpen(false);
        setSelectedForm(null);
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete message');
    }
  };

  const getStatusBadge = (status: ContactStatus) => {
    switch (status) {
      case ContactStatus.new_:
        return <Badge variant="default">New</Badge>;
      case ContactStatus.read:
        return <Badge variant="secondary">Read</Badge>;
      case ContactStatus.replied:
        return <Badge variant="outline">Replied</Badge>;
      default:
        return <Badge>Unknown</Badge>;
    }
  };

  if (!identity) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <Mail className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
        <h2 className="text-2xl font-bold mb-2">Authentication Required</h2>
        <p className="text-muted-foreground">Please log in to access the message inbox.</p>
      </div>
    );
  }

  if (adminLoading) {
    return (
      <div className="container mx-auto px-4 py-16 flex justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <Mail className="w-16 h-16 mx-auto mb-4 text-destructive" />
        <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
        <p className="text-muted-foreground">You do not have permission to access this page.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Contact Messages</h1>
          <p className="text-muted-foreground">Manage incoming contact form submissions</p>
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filter Messages</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Messages</SelectItem>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="read">Read</SelectItem>
                  <SelectItem value="replied">Replied</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {formsLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : filteredForms.length === 0 ? (
            <div className="text-center py-12">
              <Mail className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No messages found.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Sender</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredForms.map((form) => (
                  <TableRow key={form.id.toString()}>
                    <TableCell className="font-medium">{form.senderName}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{form.senderEmail}</TableCell>
                    <TableCell>{form.subject}</TableCell>
                    <TableCell className="text-sm">
                      {new Date(Number(form.timestamp) / 1000000).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{getStatusBadge(form.status)}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={() => handleViewMessage(form)}>
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(form.id)}
                          disabled={deleteFormMutation.isPending}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Message Details</DialogTitle>
          </DialogHeader>
          {selectedForm && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-1">From:</h3>
                <p className="text-muted-foreground">
                  {selectedForm.senderName} ({selectedForm.senderEmail})
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-1">Subject:</h3>
                <p className="text-muted-foreground">{selectedForm.subject}</p>
              </div>
              <div>
                <h3 className="font-semibold mb-1">Date:</h3>
                <p className="text-muted-foreground">
                  {new Date(Number(selectedForm.timestamp) / 1000000).toLocaleString()}
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-1">Message:</h3>
                <div className="bg-muted p-4 rounded-md">
                  <p className="whitespace-pre-wrap">{selectedForm.message}</p>
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Update Status:</h3>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleUpdateStatus(selectedForm.id, ContactStatus.read)}
                    disabled={updateStatusMutation.isPending}
                  >
                    Mark as Read
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleUpdateStatus(selectedForm.id, ContactStatus.replied)}
                    disabled={updateStatusMutation.isPending}
                  >
                    Mark as Replied
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
