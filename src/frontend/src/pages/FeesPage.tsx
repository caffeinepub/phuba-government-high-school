import { useState, useMemo } from 'react';
import { DollarSign, Loader2, Plus, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import {
  useGetCallerUserProfile,
  useGetStudentFeeRecords,
  useGetAllFeeRecords,
  useGetStudentPaymentHistory,
  useGetAllStudents,
  useAddFeeRecord,
  useUpdateFeeRecord,
  useRemoveFeeRecord,
  useRecordPayment,
  useIsCallerAdmin,
} from '../hooks/useQueries';
import { FeeRecord, FeeStatus, PaymentTransaction } from '../backend';
import { toast } from 'sonner';

export default function FeesPage() {
  const { identity } = useInternetIdentity();
  const { data: isAdmin } = useIsCallerAdmin();
  const { data: userProfile } = useGetCallerUserProfile();
  const { data: students = [] } = useGetAllStudents();

  const studentId = userProfile?.studentId || '';
  const { data: studentFees = [], isLoading: studentFeesLoading } = useGetStudentFeeRecords(studentId);
  const { data: allFees = [], isLoading: allFeesLoading } = useGetAllFeeRecords();
  const { data: studentPayments = [] } = useGetStudentPaymentHistory(studentId);

  const addFeeMutation = useAddFeeRecord();
  const updateFeeMutation = useUpdateFeeRecord();
  const removeFeeMutation = useRemoveFeeRecord();
  const recordPaymentMutation = useRecordPayment();

  const [feeDialogOpen, setFeeDialogOpen] = useState(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [editingFee, setEditingFee] = useState<FeeRecord | null>(null);

  const [feeFormData, setFeeFormData] = useState({
    studentId: '',
    feeType: '',
    amount: '',
    dueDate: '',
    description: '',
  });

  const [paymentFormData, setPaymentFormData] = useState({
    feeId: '',
    studentId: '',
    amount: '',
    paymentMethod: '',
    transactionId: '',
    paymentDate: '',
  });

  const fees = isAdmin ? allFees : studentFees;
  const isLoading = isAdmin ? allFeesLoading : studentFeesLoading;

  const totalOutstanding = useMemo(() => {
    return fees.reduce((sum, fee) => {
      const outstanding = Number(fee.amount) - Number(fee.paidAmount);
      return sum + (outstanding > 0 ? outstanding : 0);
    }, 0);
  }, [fees]);

  const resetFeeForm = () => {
    setFeeFormData({
      studentId: '',
      feeType: '',
      amount: '',
      dueDate: '',
      description: '',
    });
    setEditingFee(null);
  };

  const handleEditFee = (fee: FeeRecord) => {
    setEditingFee(fee);
    setFeeFormData({
      studentId: fee.studentId,
      feeType: fee.feeType,
      amount: fee.amount.toString(),
      dueDate: new Date(Number(fee.dueDate) / 1000000).toISOString().split('T')[0],
      description: fee.description,
    });
    setFeeDialogOpen(true);
  };

  const handleFeeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const fee: FeeRecord = {
        id: editingFee?.id || 0n,
        studentId: feeFormData.studentId,
        feeType: feeFormData.feeType,
        amount: BigInt(feeFormData.amount),
        dueDate: BigInt(new Date(feeFormData.dueDate).getTime() * 1000000),
        paidAmount: editingFee?.paidAmount || 0n,
        paidDate: editingFee?.paidDate,
        status: editingFee?.status || FeeStatus.pending,
        description: feeFormData.description,
      };

      if (editingFee) {
        await updateFeeMutation.mutateAsync(fee);
        toast.success('Fee updated successfully');
      } else {
        await addFeeMutation.mutateAsync(fee);
        toast.success('Fee added successfully');
      }

      setFeeDialogOpen(false);
      resetFeeForm();
    } catch (error) {
      console.error('Submit error:', error);
      toast.error('Failed to save fee');
    }
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const transaction: PaymentTransaction = {
        id: 0n,
        feeId: BigInt(paymentFormData.feeId),
        studentId: paymentFormData.studentId,
        amount: BigInt(paymentFormData.amount),
        paymentDate: BigInt(new Date(paymentFormData.paymentDate).getTime() * 1000000),
        paymentMethod: paymentFormData.paymentMethod,
        transactionId: paymentFormData.transactionId,
      };

      await recordPaymentMutation.mutateAsync(transaction);
      toast.success('Payment recorded successfully');
      setPaymentDialogOpen(false);
      setPaymentFormData({
        feeId: '',
        studentId: '',
        amount: '',
        paymentMethod: '',
        transactionId: '',
        paymentDate: '',
      });
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Failed to record payment');
    }
  };

  const handleDeleteFee = async (id: bigint) => {
    if (!confirm('Are you sure you want to delete this fee?')) return;
    try {
      await removeFeeMutation.mutateAsync(id);
      toast.success('Fee deleted successfully');
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete fee');
    }
  };

  const getFeeStatusBadge = (status: FeeStatus) => {
    switch (status) {
      case FeeStatus.paid:
        return <Badge variant="default">Paid</Badge>;
      case FeeStatus.partial:
        return <Badge variant="secondary">Partial</Badge>;
      case FeeStatus.overdue:
        return <Badge variant="destructive">Overdue</Badge>;
      default:
        return <Badge variant="outline">Pending</Badge>;
    }
  };

  const isOverdue = (dueDate: bigint, status: FeeStatus) => {
    return status !== FeeStatus.paid && Number(dueDate) < Date.now() * 1000000;
  };

  if (!identity) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <DollarSign className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
        <h2 className="text-2xl font-bold mb-2">Authentication Required</h2>
        <p className="text-muted-foreground">Please log in to view fees.</p>
      </div>
    );
  }

  if (!isAdmin && !studentId) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <DollarSign className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
        <h2 className="text-2xl font-bold mb-2">Student ID Required</h2>
        <p className="text-muted-foreground">Your profile needs a student ID to view fees.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Fee Management</h1>
          <p className="text-muted-foreground">
            {isAdmin ? 'Manage student fees and payments' : 'View your fees and payment history'}
          </p>
        </div>
        {isAdmin && (
          <div className="flex gap-2">
            <Dialog open={feeDialogOpen} onOpenChange={(open) => { setFeeDialogOpen(open); if (!open) resetFeeForm(); }}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Fee
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>{editingFee ? 'Edit Fee' : 'Add New Fee'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleFeeSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="studentId">Student</Label>
                    <Select
                      value={feeFormData.studentId}
                      onValueChange={(value) => setFeeFormData({ ...feeFormData, studentId: value })}
                      disabled={!!editingFee}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select student" />
                      </SelectTrigger>
                      <SelectContent>
                        {students.map((student) => (
                          <SelectItem key={student.id} value={student.id}>
                            {student.name} ({student.className})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="feeType">Fee Type</Label>
                    <Input
                      id="feeType"
                      value={feeFormData.feeType}
                      onChange={(e) => setFeeFormData({ ...feeFormData, feeType: e.target.value })}
                      placeholder="Tuition, Library, Lab, etc."
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="amount">Amount</Label>
                      <Input
                        id="amount"
                        type="number"
                        min="0"
                        value={feeFormData.amount}
                        onChange={(e) => setFeeFormData({ ...feeFormData, amount: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="dueDate">Due Date</Label>
                      <Input
                        id="dueDate"
                        type="date"
                        value={feeFormData.dueDate}
                        onChange={(e) => setFeeFormData({ ...feeFormData, dueDate: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={feeFormData.description}
                      onChange={(e) => setFeeFormData({ ...feeFormData, description: e.target.value })}
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={addFeeMutation.isPending || updateFeeMutation.isPending}
                    className="w-full"
                  >
                    {(addFeeMutation.isPending || updateFeeMutation.isPending) ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      editingFee ? 'Update Fee' : 'Add Fee'
                    )}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>

            <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <DollarSign className="w-4 h-4 mr-2" />
                  Record Payment
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Record Payment</DialogTitle>
                </DialogHeader>
                <form onSubmit={handlePaymentSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="paymentStudent">Student</Label>
                    <Select
                      value={paymentFormData.studentId}
                      onValueChange={(value) => setPaymentFormData({ ...paymentFormData, studentId: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select student" />
                      </SelectTrigger>
                      <SelectContent>
                        {students.map((student) => (
                          <SelectItem key={student.id} value={student.id}>
                            {student.name} ({student.className})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="paymentFee">Fee</Label>
                    <Select
                      value={paymentFormData.feeId}
                      onValueChange={(value) => setPaymentFormData({ ...paymentFormData, feeId: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select fee" />
                      </SelectTrigger>
                      <SelectContent>
                        {fees
                          .filter((f) => f.studentId === paymentFormData.studentId && f.status !== FeeStatus.paid)
                          .map((fee) => (
                            <SelectItem key={fee.id.toString()} value={fee.id.toString()}>
                              {fee.feeType} - ${fee.amount.toString()}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="paymentAmount">Amount</Label>
                    <Input
                      id="paymentAmount"
                      type="number"
                      min="0"
                      value={paymentFormData.amount}
                      onChange={(e) => setPaymentFormData({ ...paymentFormData, amount: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="paymentMethod">Payment Method</Label>
                    <Input
                      id="paymentMethod"
                      value={paymentFormData.paymentMethod}
                      onChange={(e) => setPaymentFormData({ ...paymentFormData, paymentMethod: e.target.value })}
                      placeholder="Cash, Card, Bank Transfer, etc."
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="transactionId">Transaction ID</Label>
                    <Input
                      id="transactionId"
                      value={paymentFormData.transactionId}
                      onChange={(e) => setPaymentFormData({ ...paymentFormData, transactionId: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="paymentDate">Payment Date</Label>
                    <Input
                      id="paymentDate"
                      type="date"
                      value={paymentFormData.paymentDate}
                      onChange={(e) => setPaymentFormData({ ...paymentFormData, paymentDate: e.target.value })}
                      required
                    />
                  </div>
                  <Button type="submit" disabled={recordPaymentMutation.isPending} className="w-full">
                    {recordPaymentMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Recording...
                      </>
                    ) : (
                      'Record Payment'
                    )}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        )}
      </div>

      {!isAdmin && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Outstanding Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-primary">${totalOutstanding.toFixed(2)}</div>
          </CardContent>
        </Card>
      )}

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Fee Records</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : fees.length === 0 ? (
            <div className="text-center py-12">
              <DollarSign className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No fee records found.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fee Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Paid Amount</TableHead>
                  <TableHead>Status</TableHead>
                  {isAdmin && <TableHead>Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {fees.map((fee) => {
                  const overdue = isOverdue(fee.dueDate, fee.status);
                  return (
                    <TableRow key={fee.id.toString()} className={overdue ? 'bg-destructive/10' : ''}>
                      <TableCell className="font-medium">{fee.feeType}</TableCell>
                      <TableCell>${fee.amount.toString()}</TableCell>
                      <TableCell className={overdue ? 'text-destructive font-medium' : ''}>
                        {new Date(Number(fee.dueDate) / 1000000).toLocaleDateString()}
                      </TableCell>
                      <TableCell>${fee.paidAmount.toString()}</TableCell>
                      <TableCell>{getFeeStatusBadge(fee.status)}</TableCell>
                      {isAdmin && (
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm" onClick={() => handleEditFee(fee)}>
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteFee(fee.id)}
                              disabled={removeFeeMutation.isPending}
                            >
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {!isAdmin && studentPayments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Payment History</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Transaction ID</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {studentPayments.map((payment) => (
                  <TableRow key={payment.id.toString()}>
                    <TableCell>
                      {new Date(Number(payment.paymentDate) / 1000000).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="font-medium">${payment.amount.toString()}</TableCell>
                    <TableCell>{payment.paymentMethod}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{payment.transactionId}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
