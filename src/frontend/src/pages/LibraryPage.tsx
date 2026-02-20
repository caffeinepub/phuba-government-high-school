import { useState, useMemo } from 'react';
import { BookOpen, Loader2, Plus, Edit, Trash2, Search, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import {
  useGetCallerUserProfile,
  useGetAllBooks,
  useGetStudentBorrowingHistory,
  useGetAllBorrowingRecords,
  useGetAllStudents,
  useAddBook,
  useUpdateBook,
  useRemoveBook,
  useBorrowBook,
  useReturnBook,
  useIsCallerAdmin,
} from '../hooks/useQueries';
import { Book, BorrowingRecord, BorrowStatus } from '../backend';
import { ExternalBlob } from '../backend';
import { toast } from 'sonner';

export default function LibraryPage() {
  const { identity } = useInternetIdentity();
  const { data: isAdmin } = useIsCallerAdmin();
  const { data: userProfile } = useGetCallerUserProfile();
  const { data: books = [], isLoading: booksLoading } = useGetAllBooks();
  const { data: students = [] } = useGetAllStudents();

  const studentId = userProfile?.studentId || '';
  const { data: studentBorrowing = [] } = useGetStudentBorrowingHistory(studentId);
  const { data: allBorrowing = [] } = useGetAllBorrowingRecords();

  const addBookMutation = useAddBook();
  const updateBookMutation = useUpdateBook();
  const removeBookMutation = useRemoveBook();
  const borrowBookMutation = useBorrowBook();
  const returnBookMutation = useReturnBook();

  const [bookDialogOpen, setBookDialogOpen] = useState(false);
  const [borrowDialogOpen, setBorrowDialogOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);

  const [bookFormData, setBookFormData] = useState({
    title: '',
    author: '',
    isbn: '',
    category: '',
    totalCopies: '',
    availableCopies: '',
    thumbnailFile: null as File | null,
  });

  const [borrowFormData, setBorrowFormData] = useState({
    bookId: '',
    studentId: '',
    dueDate: '',
  });

  const filteredBooks = useMemo(() => {
    if (!searchQuery) return books;
    const query = searchQuery.toLowerCase();
    return books.filter(
      (book) =>
        book.title.toLowerCase().includes(query) ||
        book.author.toLowerCase().includes(query) ||
        book.isbn.toLowerCase().includes(query)
    );
  }, [books, searchQuery]);

  const currentBorrowings = useMemo(() => {
    const borrowings = isAdmin ? allBorrowing : studentBorrowing;
    return borrowings.filter((b) => b.status === BorrowStatus.borrowed || b.status === BorrowStatus.overdue);
  }, [isAdmin, allBorrowing, studentBorrowing]);

  const resetBookForm = () => {
    setBookFormData({
      title: '',
      author: '',
      isbn: '',
      category: '',
      totalCopies: '',
      availableCopies: '',
      thumbnailFile: null,
    });
    setEditingBook(null);
    setUploadProgress(0);
  };

  const handleEditBook = (book: Book) => {
    setEditingBook(book);
    setBookFormData({
      title: book.title,
      author: book.author,
      isbn: book.isbn,
      category: book.category,
      totalCopies: book.totalCopies.toString(),
      availableCopies: book.availableCopies.toString(),
      thumbnailFile: null,
    });
    setBookDialogOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setBookFormData({ ...bookFormData, thumbnailFile: e.target.files[0] });
    }
  };

  const handleBookSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      let thumbnailBlob: ExternalBlob;

      if (bookFormData.thumbnailFile) {
        const arrayBuffer = await bookFormData.thumbnailFile.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        thumbnailBlob = ExternalBlob.fromBytes(uint8Array).withUploadProgress((percentage) => {
          setUploadProgress(percentage);
        });
      } else if (editingBook) {
        thumbnailBlob = editingBook.thumbnail;
      } else {
        const response = await fetch('/assets/generated/library-icon.dim_200x200.png');
        const arrayBuffer = await response.arrayBuffer();
        thumbnailBlob = ExternalBlob.fromBytes(new Uint8Array(arrayBuffer));
      }

      const book: Book = {
        id: editingBook?.id || 0n,
        title: bookFormData.title,
        author: bookFormData.author,
        isbn: bookFormData.isbn,
        category: bookFormData.category,
        totalCopies: BigInt(bookFormData.totalCopies),
        availableCopies: BigInt(bookFormData.availableCopies),
        thumbnail: thumbnailBlob,
      };

      if (editingBook) {
        await updateBookMutation.mutateAsync(book);
        toast.success('Book updated successfully');
      } else {
        await addBookMutation.mutateAsync(book);
        toast.success('Book added successfully');
      }

      setBookDialogOpen(false);
      resetBookForm();
    } catch (error) {
      console.error('Submit error:', error);
      toast.error('Failed to save book');
    }
  };

  const handleBorrowSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await borrowBookMutation.mutateAsync({
        bookId: BigInt(borrowFormData.bookId),
        studentId: borrowFormData.studentId,
        dueDate: BigInt(new Date(borrowFormData.dueDate).getTime() * 1000000),
      });
      toast.success('Book borrowed successfully');
      setBorrowDialogOpen(false);
      setBorrowFormData({ bookId: '', studentId: '', dueDate: '' });
    } catch (error) {
      console.error('Borrow error:', error);
      toast.error('Failed to borrow book');
    }
  };

  const handleReturn = async (borrowingId: bigint) => {
    try {
      await returnBookMutation.mutateAsync(borrowingId);
      toast.success('Book returned successfully');
    } catch (error) {
      console.error('Return error:', error);
      toast.error('Failed to return book');
    }
  };

  const handleDeleteBook = async (id: bigint) => {
    if (!confirm('Are you sure you want to delete this book?')) return;
    try {
      await removeBookMutation.mutateAsync(id);
      toast.success('Book deleted successfully');
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete book');
    }
  };

  const getBookById = (id: bigint) => books.find((b) => b.id === id);
  const getStudentById = (id: string) => students.find((s) => s.id === id);

  const isOverdue = (dueDate: bigint) => {
    return Number(dueDate) < Date.now() * 1000000;
  };

  if (!identity) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <BookOpen className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
        <h2 className="text-2xl font-bold mb-2">Authentication Required</h2>
        <p className="text-muted-foreground">Please log in to access the library.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Library</h1>
          <p className="text-muted-foreground">Browse books and manage borrowing</p>
        </div>
        {isAdmin && (
          <div className="flex gap-2">
            <Dialog open={bookDialogOpen} onOpenChange={(open) => { setBookDialogOpen(open); if (!open) resetBookForm(); }}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Book
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>{editingBook ? 'Edit Book' : 'Add New Book'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleBookSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={bookFormData.title}
                      onChange={(e) => setBookFormData({ ...bookFormData, title: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="author">Author</Label>
                    <Input
                      id="author"
                      value={bookFormData.author}
                      onChange={(e) => setBookFormData({ ...bookFormData, author: e.target.value })}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="isbn">ISBN</Label>
                      <Input
                        id="isbn"
                        value={bookFormData.isbn}
                        onChange={(e) => setBookFormData({ ...bookFormData, isbn: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="category">Category</Label>
                      <Input
                        id="category"
                        value={bookFormData.category}
                        onChange={(e) => setBookFormData({ ...bookFormData, category: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="totalCopies">Total Copies</Label>
                      <Input
                        id="totalCopies"
                        type="number"
                        min="1"
                        value={bookFormData.totalCopies}
                        onChange={(e) => setBookFormData({ ...bookFormData, totalCopies: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="availableCopies">Available Copies</Label>
                      <Input
                        id="availableCopies"
                        type="number"
                        min="0"
                        value={bookFormData.availableCopies}
                        onChange={(e) => setBookFormData({ ...bookFormData, availableCopies: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="thumbnail">Thumbnail {editingBook && '(leave empty to keep current)'}</Label>
                    <Input id="thumbnail" type="file" accept="image/*" onChange={handleFileChange} />
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
                    disabled={addBookMutation.isPending || updateBookMutation.isPending}
                    className="w-full"
                  >
                    {(addBookMutation.isPending || updateBookMutation.isPending) ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      editingBook ? 'Update Book' : 'Add Book'
                    )}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>

            <Dialog open={borrowDialogOpen} onOpenChange={setBorrowDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Upload className="w-4 h-4 mr-2" />
                  Borrow Book
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Borrow Book</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleBorrowSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="borrowStudent">Student</Label>
                    <Select
                      value={borrowFormData.studentId}
                      onValueChange={(value) => setBorrowFormData({ ...borrowFormData, studentId: value })}
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
                    <Label htmlFor="borrowBook">Book</Label>
                    <Select
                      value={borrowFormData.bookId}
                      onValueChange={(value) => setBorrowFormData({ ...borrowFormData, bookId: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select book" />
                      </SelectTrigger>
                      <SelectContent>
                        {books.filter((b) => b.availableCopies > 0n).map((book) => (
                          <SelectItem key={book.id.toString()} value={book.id.toString()}>
                            {book.title} by {book.author}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="dueDate">Due Date</Label>
                    <Input
                      id="dueDate"
                      type="date"
                      value={borrowFormData.dueDate}
                      onChange={(e) => setBorrowFormData({ ...borrowFormData, dueDate: e.target.value })}
                      required
                    />
                  </div>
                  <Button type="submit" disabled={borrowBookMutation.isPending} className="w-full">
                    {borrowBookMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      'Borrow Book'
                    )}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        )}
      </div>

      <Tabs defaultValue="catalog" className="space-y-6">
        <TabsList>
          <TabsTrigger value="catalog">Book Catalog</TabsTrigger>
          <TabsTrigger value="borrowing">
            {isAdmin ? 'All Borrowings' : 'My Borrowings'}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="catalog">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <Search className="w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Search by title, author, or ISBN..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1"
                />
              </div>
            </CardHeader>
            <CardContent>
              {booksLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : filteredBooks.length === 0 ? (
                <div className="text-center py-12">
                  <BookOpen className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">No books found.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Cover</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Author</TableHead>
                      <TableHead>ISBN</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Availability</TableHead>
                      {isAdmin && <TableHead>Actions</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredBooks.map((book) => (
                      <TableRow key={book.id.toString()}>
                        <TableCell>
                          <img
                            src={book.thumbnail.getDirectURL()}
                            alt={book.title}
                            className="w-12 h-16 object-cover rounded"
                          />
                        </TableCell>
                        <TableCell className="font-medium">{book.title}</TableCell>
                        <TableCell>{book.author}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{book.isbn}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{book.category}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={book.availableCopies > 0n ? 'default' : 'destructive'}>
                            {book.availableCopies.toString()}/{book.totalCopies.toString()}
                          </Badge>
                        </TableCell>
                        {isAdmin && (
                          <TableCell>
                            <div className="flex gap-2">
                              <Button variant="ghost" size="sm" onClick={() => handleEditBook(book)}>
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteBook(book.id)}
                                disabled={removeBookMutation.isPending}
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
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="borrowing">
          <Card>
            <CardHeader>
              <CardTitle>Current Borrowings</CardTitle>
            </CardHeader>
            <CardContent>
              {currentBorrowings.length === 0 ? (
                <div className="text-center py-12">
                  <BookOpen className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">No active borrowings.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Book</TableHead>
                      {isAdmin && <TableHead>Student</TableHead>}
                      <TableHead>Borrow Date</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Status</TableHead>
                      {isAdmin && <TableHead>Actions</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentBorrowings.map((borrowing) => {
                      const book = getBookById(borrowing.bookId);
                      const student = getStudentById(borrowing.studentId);
                      const overdue = isOverdue(borrowing.dueDate);

                      return (
                        <TableRow key={borrowing.id.toString()}>
                          <TableCell className="font-medium">{book?.title || 'Unknown'}</TableCell>
                          {isAdmin && <TableCell>{student?.name || borrowing.studentId}</TableCell>}
                          <TableCell>
                            {new Date(Number(borrowing.borrowDate) / 1000000).toLocaleDateString()}
                          </TableCell>
                          <TableCell className={overdue ? 'text-destructive font-medium' : ''}>
                            {new Date(Number(borrowing.dueDate) / 1000000).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Badge variant={overdue ? 'destructive' : 'default'}>
                              {overdue ? 'Overdue' : 'Borrowed'}
                            </Badge>
                          </TableCell>
                          {isAdmin && (
                            <TableCell>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleReturn(borrowing.id)}
                                disabled={returnBookMutation.isPending}
                              >
                                Return
                              </Button>
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
        </TabsContent>
      </Tabs>
    </div>
  );
}
