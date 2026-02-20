import { useState, useMemo } from 'react';
import { GraduationCap, Loader2, Plus, Edit, Trash2 } from 'lucide-react';
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
  useGetStudentExamResults,
  useGetAllExamResults,
  useGetAllStudents,
  useAddExamResult,
  useUpdateExamResult,
  useRemoveExamResult,
  useIsCallerAdmin,
} from '../hooks/useQueries';
import { ExamResult } from '../backend';
import { toast } from 'sonner';

export default function ExamResultsPage() {
  const { identity } = useInternetIdentity();
  const { data: isAdmin } = useIsCallerAdmin();
  const { data: userProfile } = useGetCallerUserProfile();
  const { data: students = [] } = useGetAllStudents();

  const studentId = userProfile?.studentId || '';
  const { data: studentResults = [], isLoading: studentLoading } = useGetStudentExamResults(studentId);
  const { data: allResults = [], isLoading: allLoading } = useGetAllExamResults();

  const addResultMutation = useAddExamResult();
  const updateResultMutation = useUpdateExamResult();
  const removeResultMutation = useRemoveExamResult();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingResult, setEditingResult] = useState<ExamResult | null>(null);
  const [subjectFilter, setSubjectFilter] = useState('all');

  const [formData, setFormData] = useState({
    studentId: '',
    examName: '',
    subject: '',
    grade: '',
    percentage: '',
    examDate: '',
    remarks: '',
  });

  const results = isAdmin ? allResults : studentResults;
  const isLoading = isAdmin ? allLoading : studentLoading;

  const subjects = useMemo(() => {
    const subjectSet = new Set(results.map((r) => r.subject));
    return Array.from(subjectSet);
  }, [results]);

  const filteredResults = useMemo(() => {
    if (subjectFilter === 'all') return results;
    return results.filter((r) => r.subject === subjectFilter);
  }, [results, subjectFilter]);

  const resetForm = () => {
    setFormData({
      studentId: '',
      examName: '',
      subject: '',
      grade: '',
      percentage: '',
      examDate: '',
      remarks: '',
    });
    setEditingResult(null);
  };

  const handleEdit = (result: ExamResult) => {
    setEditingResult(result);
    setFormData({
      studentId: result.studentId,
      examName: result.examName,
      subject: result.subject,
      grade: result.grade,
      percentage: result.percentage.toString(),
      examDate: new Date(Number(result.examDate) / 1000000).toISOString().split('T')[0],
      remarks: result.remarks,
    });
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const result: ExamResult = {
        studentId: formData.studentId,
        examName: formData.examName,
        subject: formData.subject,
        grade: formData.grade,
        percentage: BigInt(formData.percentage),
        examDate: BigInt(new Date(formData.examDate).getTime() * 1000000),
        remarks: formData.remarks,
      };

      if (editingResult) {
        await updateResultMutation.mutateAsync(result);
        toast.success('Exam result updated successfully');
      } else {
        await addResultMutation.mutateAsync(result);
        toast.success('Exam result added successfully');
      }

      setDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Submit error:', error);
      toast.error('Failed to save exam result');
    }
  };

  const handleDelete = async (studentId: string, examName: string) => {
    if (!confirm('Are you sure you want to delete this exam result?')) return;
    try {
      await removeResultMutation.mutateAsync({ studentId, examName });
      toast.success('Exam result deleted successfully');
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete exam result');
    }
  };

  const getGradeBadgeVariant = (percentage: bigint) => {
    const pct = Number(percentage);
    if (pct >= 90) return 'default';
    if (pct >= 75) return 'secondary';
    if (pct >= 60) return 'outline';
    return 'destructive';
  };

  if (!identity) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <GraduationCap className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
        <h2 className="text-2xl font-bold mb-2">Authentication Required</h2>
        <p className="text-muted-foreground">Please log in to view exam results.</p>
      </div>
    );
  }

  if (!isAdmin && !studentId) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <GraduationCap className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
        <h2 className="text-2xl font-bold mb-2">Student ID Required</h2>
        <p className="text-muted-foreground">Your profile needs a student ID to view exam results.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Exam Results</h1>
          <p className="text-muted-foreground">
            {isAdmin ? 'Manage all student exam results' : 'View your exam performance'}
          </p>
        </div>
        {isAdmin && (
          <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Result
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{editingResult ? 'Edit Exam Result' : 'Add New Exam Result'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="studentId">Student</Label>
                  <Select
                    value={formData.studentId}
                    onValueChange={(value) => setFormData({ ...formData, studentId: value })}
                    disabled={!!editingResult}
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
                  <Label htmlFor="examName">Exam Name</Label>
                  <Input
                    id="examName"
                    value={formData.examName}
                    onChange={(e) => setFormData({ ...formData, examName: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="grade">Grade</Label>
                    <Input
                      id="grade"
                      value={formData.grade}
                      onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                      placeholder="A, B, C, etc."
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="percentage">Percentage</Label>
                    <Input
                      id="percentage"
                      type="number"
                      min="0"
                      max="100"
                      value={formData.percentage}
                      onChange={(e) => setFormData({ ...formData, percentage: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="examDate">Exam Date</Label>
                  <Input
                    id="examDate"
                    type="date"
                    value={formData.examDate}
                    onChange={(e) => setFormData({ ...formData, examDate: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="remarks">Remarks</Label>
                  <Textarea
                    id="remarks"
                    value={formData.remarks}
                    onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                  />
                </div>
                <Button
                  type="submit"
                  disabled={addResultMutation.isPending || updateResultMutation.isPending}
                  className="w-full"
                >
                  {(addResultMutation.isPending || updateResultMutation.isPending) ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    editingResult ? 'Update Result' : 'Add Result'
                  )}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filter Results</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="subjectFilter">Subject</Label>
              <Select value={subjectFilter} onValueChange={setSubjectFilter}>
                <SelectTrigger id="subjectFilter">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Subjects</SelectItem>
                  {subjects.map((subject) => (
                    <SelectItem key={subject} value={subject}>
                      {subject}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : filteredResults.length === 0 ? (
        <div className="text-center py-12">
          <GraduationCap className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">No exam results found.</p>
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Exam Name</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Grade</TableHead>
                  <TableHead>Percentage</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Remarks</TableHead>
                  {isAdmin && <TableHead>Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredResults.map((result, idx) => (
                  <TableRow key={idx}>
                    <TableCell className="font-medium">{result.examName}</TableCell>
                    <TableCell>{result.subject}</TableCell>
                    <TableCell>
                      <Badge variant={getGradeBadgeVariant(result.percentage)}>{result.grade}</Badge>
                    </TableCell>
                    <TableCell>{result.percentage.toString()}%</TableCell>
                    <TableCell>
                      {new Date(Number(result.examDate) / 1000000).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{result.remarks}</TableCell>
                    {isAdmin && (
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" onClick={() => handleEdit(result)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(result.studentId, result.examName)}
                            disabled={removeResultMutation.isPending}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    )}
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
