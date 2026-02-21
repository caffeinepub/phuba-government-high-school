import { useState } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import {
  usePoems,
  usePoemsByCategory,
  useCreatePoem,
  useUpdatePoem,
  useDeletePoem,
  useIsCallerAdmin,
} from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, Plus, Edit, Trash2, BookOpen, Filter } from 'lucide-react';
import { toast } from 'sonner';
import type { Poem } from '../backend';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const CATEGORIES = ['Traditional', 'Modern', 'Nature', 'Love', 'Historical', 'Cultural', 'Spiritual'];

export default function PoumaiPoemsPage() {
  const { identity } = useInternetIdentity();
  const { data: isAdmin } = useIsCallerAdmin();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPoem, setEditingPoem] = useState<Poem | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [poemToDelete, setPoemToDelete] = useState<Poem | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    poemText: '',
    dateWritten: '',
    category: '',
    englishTranslation: '',
    culturalContext: '',
  });

  const { data: allPoems, isLoading: allPoemsLoading } = usePoems();
  const { data: filteredPoems, isLoading: filteredLoading } = usePoemsByCategory(
    selectedCategory !== 'all' ? selectedCategory : ''
  );

  const createMutation = useCreatePoem();
  const updateMutation = useUpdatePoem();
  const deleteMutation = useDeletePoem();

  const poems = selectedCategory === 'all' ? allPoems : filteredPoems;
  const isLoading = selectedCategory === 'all' ? allPoemsLoading : filteredLoading;

  const isAuthenticated = !!identity;

  const resetForm = () => {
    setFormData({
      title: '',
      author: '',
      poemText: '',
      dateWritten: '',
      category: '',
      englishTranslation: '',
      culturalContext: '',
    });
    setEditingPoem(null);
  };

  const handleOpenDialog = (poem?: Poem) => {
    if (poem) {
      setEditingPoem(poem);
      setFormData({
        title: poem.title,
        author: poem.author,
        poemText: poem.poemText,
        dateWritten: poem.dateWritten,
        category: poem.category,
        englishTranslation: poem.englishTranslation || '',
        culturalContext: poem.culturalContext || '',
      });
    } else {
      resetForm();
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setTimeout(resetForm, 200);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.author || !formData.poemText || !formData.dateWritten || !formData.category) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      if (editingPoem) {
        await updateMutation.mutateAsync({
          id: editingPoem.id,
          title: formData.title,
          author: formData.author,
          poemText: formData.poemText,
          dateWritten: formData.dateWritten,
          category: formData.category,
          englishTranslation: formData.englishTranslation || null,
          culturalContext: formData.culturalContext || null,
        });
        toast.success('Poem updated successfully');
      } else {
        await createMutation.mutateAsync({
          title: formData.title,
          author: formData.author,
          poemText: formData.poemText,
          dateWritten: formData.dateWritten,
          category: formData.category,
          englishTranslation: formData.englishTranslation || null,
          culturalContext: formData.culturalContext || null,
        });
        toast.success('Poem created successfully');
      }
      handleCloseDialog();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save poem');
    }
  };

  const handleDeleteClick = (poem: Poem) => {
    setPoemToDelete(poem);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!poemToDelete) return;

    try {
      await deleteMutation.mutateAsync(poemToDelete.id);
      toast.success('Poem deleted successfully');
      setDeleteDialogOpen(false);
      setPoemToDelete(null);
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete poem');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <BookOpen className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-2xl font-bold text-foreground mb-4">Authentication Required</h2>
          <p className="text-muted-foreground mb-6">
            Please log in to view the Poumai Poems collection.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Poumai Poems</h1>
            <p className="text-muted-foreground">
              A collection of traditional and modern Poumai poetry celebrating our rich cultural heritage
            </p>
          </div>
          {isAdmin && (
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => handleOpenDialog()} className="shrink-0">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Poem
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingPoem ? 'Edit Poem' : 'Add New Poem'}</DialogTitle>
                  <DialogDescription>
                    {editingPoem
                      ? 'Update the poem details below'
                      : 'Fill in the details to add a new poem to the collection'}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">
                      Title <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Enter poem title"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="author">
                      Author <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="author"
                      value={formData.author}
                      onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                      placeholder="Enter author name"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="poemText">
                      Poem Text <span className="text-destructive">*</span>
                    </Label>
                    <Textarea
                      id="poemText"
                      value={formData.poemText}
                      onChange={(e) => setFormData({ ...formData, poemText: e.target.value })}
                      placeholder="Enter the poem text (line breaks will be preserved)"
                      rows={8}
                      className="font-serif"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="dateWritten">
                        Date Written <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="dateWritten"
                        type="date"
                        value={formData.dateWritten}
                        onChange={(e) => setFormData({ ...formData, dateWritten: e.target.value })}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="category">
                        Category <span className="text-destructive">*</span>
                      </Label>
                      <Select
                        value={formData.category}
                        onValueChange={(value) => setFormData({ ...formData, category: value })}
                      >
                        <SelectTrigger id="category">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {CATEGORIES.map((cat) => (
                            <SelectItem key={cat} value={cat}>
                              {cat}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="englishTranslation">English Translation (Optional)</Label>
                    <Textarea
                      id="englishTranslation"
                      value={formData.englishTranslation}
                      onChange={(e) => setFormData({ ...formData, englishTranslation: e.target.value })}
                      placeholder="Enter English translation if available"
                      rows={6}
                      className="font-serif"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="culturalContext">Cultural Context (Optional)</Label>
                    <Textarea
                      id="culturalContext"
                      value={formData.culturalContext}
                      onChange={(e) => setFormData({ ...formData, culturalContext: e.target.value })}
                      placeholder="Provide cultural or historical context"
                      rows={4}
                    />
                  </div>

                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={handleCloseDialog}>
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={createMutation.isPending || updateMutation.isPending}
                    >
                      {(createMutation.isPending || updateMutation.isPending) && (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      )}
                      {editingPoem ? 'Update Poem' : 'Add Poem'}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Category Filter */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Filter className="w-4 h-4" />
            <span>Filter by category:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedCategory === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory('all')}
            >
              All
            </Button>
            {CATEGORIES.map((cat) => (
              <Button
                key={cat}
                variant={selectedCategory === cat ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Poems Grid */}
      {isLoading ? (
        <div className="flex justify-center items-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : !poems || poems.length === 0 ? (
        <div className="text-center py-16">
          <BookOpen className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-xl font-semibold text-foreground mb-2">No poems found</h3>
          <p className="text-muted-foreground">
            {selectedCategory === 'all'
              ? 'No poems have been added yet.'
              : `No poems found in the "${selectedCategory}" category.`}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {poems.map((poem) => (
            <Card key={Number(poem.id)} className="flex flex-col hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-xl mb-1 truncate">{poem.title}</CardTitle>
                    <CardDescription className="text-sm">
                      by {poem.author} • {poem.dateWritten}
                    </CardDescription>
                  </div>
                  {isAdmin && (
                    <div className="flex gap-1 shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleOpenDialog(poem)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => handleDeleteClick(poem)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
                <div className="mt-2">
                  <span className="inline-block px-2 py-1 text-xs font-medium rounded-full bg-primary/10 text-primary">
                    {poem.category}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="flex-1 space-y-4">
                <div>
                  <h4 className="text-sm font-semibold text-foreground mb-2">Poem:</h4>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap font-serif leading-relaxed">
                    {poem.poemText}
                  </p>
                </div>

                {poem.englishTranslation && (
                  <div>
                    <h4 className="text-sm font-semibold text-foreground mb-2">English Translation:</h4>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap font-serif leading-relaxed">
                      {poem.englishTranslation}
                    </p>
                  </div>
                )}

                {poem.culturalContext && (
                  <div>
                    <h4 className="text-sm font-semibold text-foreground mb-2">Cultural Context:</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {poem.culturalContext}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the poem "{poemToDelete?.title}". This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPoemToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
