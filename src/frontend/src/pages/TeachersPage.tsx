import { useState } from 'react';
import { UserCircle, Upload, Loader2, Edit, Trash2, Mail, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import {
  useGetAllTeacherProfiles,
  useAddTeacherProfile,
  useUpdateTeacherProfile,
  useRemoveTeacherProfile,
  useIsCallerAdmin,
} from '../hooks/useQueries';
import { TeacherProfile } from '../backend';
import { ExternalBlob } from '../backend';
import { toast } from 'sonner';

export default function TeachersPage() {
  const { identity } = useInternetIdentity();
  const { data: isAdmin } = useIsCallerAdmin();
  const { data: teachers = [], isLoading } = useGetAllTeacherProfiles();
  const addTeacherMutation = useAddTeacherProfile();
  const updateTeacherMutation = useUpdateTeacherProfile();
  const removeTeacherMutation = useRemoveTeacherProfile();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<TeacherProfile | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const [formData, setFormData] = useState({
    name: '',
    subjects: '',
    qualifications: '',
    contactInfo: '',
    officeHours: '',
    photoFile: null as File | null,
  });

  const resetForm = () => {
    setFormData({
      name: '',
      subjects: '',
      qualifications: '',
      contactInfo: '',
      officeHours: '',
      photoFile: null,
    });
    setEditingTeacher(null);
    setUploadProgress(0);
  };

  const handleEdit = (teacher: TeacherProfile) => {
    setEditingTeacher(teacher);
    setFormData({
      name: teacher.name,
      subjects: teacher.subjects.join(', '),
      qualifications: teacher.qualifications,
      contactInfo: teacher.contactInfo,
      officeHours: teacher.officeHours,
      photoFile: null,
    });
    setDialogOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, photoFile: e.target.files[0] });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      let photoBlob: ExternalBlob;

      if (formData.photoFile) {
        const arrayBuffer = await formData.photoFile.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        photoBlob = ExternalBlob.fromBytes(uint8Array).withUploadProgress((percentage) => {
          setUploadProgress(percentage);
        });
      } else if (editingTeacher) {
        photoBlob = editingTeacher.photo;
      } else {
        const response = await fetch('/assets/generated/teacher-placeholder.dim_400x400.png');
        const arrayBuffer = await response.arrayBuffer();
        photoBlob = ExternalBlob.fromBytes(new Uint8Array(arrayBuffer));
      }

      const subjectsArray = formData.subjects.split(',').map((s) => s.trim()).filter((s) => s);

      const profile: TeacherProfile = {
        id: editingTeacher?.id || `teacher-${Date.now()}`,
        name: formData.name,
        subjects: subjectsArray,
        qualifications: formData.qualifications,
        contactInfo: formData.contactInfo,
        officeHours: formData.officeHours,
        photo: photoBlob,
      };

      if (editingTeacher) {
        await updateTeacherMutation.mutateAsync(profile);
        toast.success('Teacher profile updated successfully');
      } else {
        await addTeacherMutation.mutateAsync(profile);
        toast.success('Teacher profile added successfully');
      }

      setDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Submit error:', error);
      toast.error('Failed to save teacher profile');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this teacher profile?')) return;
    try {
      await removeTeacherMutation.mutateAsync(id);
      toast.success('Teacher profile deleted successfully');
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete teacher profile');
    }
  };

  if (!identity) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <UserCircle className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
        <h2 className="text-2xl font-bold mb-2">Authentication Required</h2>
        <p className="text-muted-foreground">Please log in to view teacher profiles.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Our Teachers</h1>
          <p className="text-muted-foreground">Meet our dedicated teaching staff</p>
        </div>
        {isAdmin && (
          <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
            <DialogTrigger asChild>
              <Button>
                <Upload className="w-4 h-4 mr-2" />
                Add Teacher
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingTeacher ? 'Edit Teacher Profile' : 'Add New Teacher'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="subjects">Subjects (comma-separated)</Label>
                  <Input
                    id="subjects"
                    value={formData.subjects}
                    onChange={(e) => setFormData({ ...formData, subjects: e.target.value })}
                    placeholder="Mathematics, Physics, Chemistry"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="qualifications">Qualifications</Label>
                  <Textarea
                    id="qualifications"
                    value={formData.qualifications}
                    onChange={(e) => setFormData({ ...formData, qualifications: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="contactInfo">Contact Info</Label>
                  <Input
                    id="contactInfo"
                    value={formData.contactInfo}
                    onChange={(e) => setFormData({ ...formData, contactInfo: e.target.value })}
                    placeholder="email@example.com"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="officeHours">Office Hours</Label>
                  <Input
                    id="officeHours"
                    value={formData.officeHours}
                    onChange={(e) => setFormData({ ...formData, officeHours: e.target.value })}
                    placeholder="Mon-Fri 2:00 PM - 4:00 PM"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="photo">Photo {editingTeacher && '(leave empty to keep current)'}</Label>
                  <Input id="photo" type="file" accept="image/*" onChange={handleFileChange} />
                </div>
                {uploadProgress > 0 && uploadProgress < 100 && (
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                )}
                <Button
                  type="submit"
                  disabled={addTeacherMutation.isPending || updateTeacherMutation.isPending}
                  className="w-full"
                >
                  {(addTeacherMutation.isPending || updateTeacherMutation.isPending) ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    editingTeacher ? 'Update Teacher' : 'Add Teacher'
                  )}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : teachers.length === 0 ? (
        <div className="text-center py-12">
          <UserCircle className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">No teacher profiles available yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teachers.map((teacher) => (
            <Card key={teacher.id}>
              <CardHeader className="text-center">
                <div className="w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden bg-muted">
                  <img
                    src={teacher.photo.getDirectURL()}
                    alt={teacher.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardTitle>{teacher.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm font-medium mb-2">Subjects:</p>
                  <div className="flex flex-wrap gap-2">
                    {teacher.subjects.map((subject, idx) => (
                      <Badge key={idx} variant="secondary">
                        {subject}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium mb-1">Qualifications:</p>
                  <p className="text-sm text-muted-foreground">{teacher.qualifications}</p>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="w-4 h-4" />
                  <span>{teacher.contactInfo}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>{teacher.officeHours}</span>
                </div>
                {isAdmin && (
                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(teacher)} className="flex-1">
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(teacher.id)}
                      disabled={removeTeacherMutation.isPending}
                      className="flex-1"
                    >
                      <Trash2 className="w-4 h-4 mr-1 text-destructive" />
                      Delete
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
