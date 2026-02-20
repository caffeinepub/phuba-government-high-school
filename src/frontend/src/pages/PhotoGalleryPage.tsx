import { useState } from 'react';
import { Camera, Upload, Loader2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import {
  useGetPhotoRecordsByCategory,
  useGetAllPhotoRecords,
  useAddPhotoRecord,
  useRemovePhotoRecord,
  useIsCallerAdmin,
} from '../hooks/useQueries';
import { PhotoCategory, PhotoRecord } from '../backend';
import { ExternalBlob } from '../backend';
import { toast } from 'sonner';

export default function PhotoGalleryPage() {
  const { identity } = useInternetIdentity();
  const { data: isAdmin } = useIsCallerAdmin();
  const [selectedCategory, setSelectedCategory] = useState<PhotoCategory>(PhotoCategory.general);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const { data: photos = [], isLoading } = useGetPhotoRecordsByCategory(selectedCategory);
  const addPhotoMutation = useAddPhotoRecord();
  const removePhotoMutation = useRemovePhotoRecord();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: PhotoCategory.general,
    imageFile: null as File | null,
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, imageFile: e.target.files[0] });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.imageFile) {
      toast.error('Please select an image');
      return;
    }

    try {
      const arrayBuffer = await formData.imageFile.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      const blob = ExternalBlob.fromBytes(uint8Array).withUploadProgress((percentage) => {
        setUploadProgress(percentage);
      });

      const record: PhotoRecord = {
        id: 0n,
        title: formData.title,
        description: formData.description,
        category: formData.category,
        image: blob,
        uploadedBy: identity?.getPrincipal().toString() || 'unknown',
        timestamp: BigInt(Date.now() * 1000000),
      };

      await addPhotoMutation.mutateAsync(record);
      toast.success('Photo uploaded successfully');
      setUploadDialogOpen(false);
      setFormData({ title: '', description: '', category: PhotoCategory.general, imageFile: null });
      setUploadProgress(0);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload photo');
    }
  };

  const handleDelete = async (id: bigint) => {
    if (!confirm('Are you sure you want to delete this photo?')) return;
    try {
      await removePhotoMutation.mutateAsync(id);
      toast.success('Photo deleted successfully');
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete photo');
    }
  };

  if (!identity) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <Camera className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
        <h2 className="text-2xl font-bold mb-2">Authentication Required</h2>
        <p className="text-muted-foreground">Please log in to view the photo gallery.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Photo Gallery</h1>
          <p className="text-muted-foreground">Browse school photos by category</p>
        </div>
        {isAdmin && (
          <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Upload className="w-4 h-4 mr-2" />
                Upload Photo
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Upload New Photo</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value as PhotoCategory })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={PhotoCategory.general}>General</SelectItem>
                      <SelectItem value={PhotoCategory.events}>Events</SelectItem>
                      <SelectItem value={PhotoCategory.achievements}>Achievements</SelectItem>
                      <SelectItem value={PhotoCategory.facilities}>Facilities</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="image">Image</Label>
                  <Input id="image" type="file" accept="image/*" onChange={handleFileChange} required />
                </div>
                {uploadProgress > 0 && uploadProgress < 100 && (
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                )}
                <Button type="submit" disabled={addPhotoMutation.isPending} className="w-full">
                  {addPhotoMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    'Upload Photo'
                  )}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Tabs value={selectedCategory} onValueChange={(value) => setSelectedCategory(value as PhotoCategory)}>
        <TabsList className="mb-6">
          <TabsTrigger value={PhotoCategory.general}>General</TabsTrigger>
          <TabsTrigger value={PhotoCategory.events}>Events</TabsTrigger>
          <TabsTrigger value={PhotoCategory.achievements}>Achievements</TabsTrigger>
          <TabsTrigger value={PhotoCategory.facilities}>Facilities</TabsTrigger>
        </TabsList>

        <TabsContent value={selectedCategory}>
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : photos.length === 0 ? (
            <div className="text-center py-12">
              <Camera className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No photos in this category yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {photos.map((photo) => (
                <Card key={photo.id.toString()} className="overflow-hidden">
                  <div className="aspect-video relative overflow-hidden bg-muted">
                    <img
                      src={photo.image.getDirectURL()}
                      alt={photo.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-1">{photo.title}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{photo.description}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-muted-foreground">
                        {new Date(Number(photo.timestamp) / 1000000).toLocaleDateString()}
                      </span>
                      {isAdmin && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(photo.id)}
                          disabled={removePhotoMutation.isPending}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
