import { useState, useMemo } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetAllStudents } from '../hooks/useQueries';
import { Search, Users, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useNavigate } from '@tanstack/react-router';

export default function StudentDirectoryPage() {
  const { identity } = useInternetIdentity();
  const navigate = useNavigate();
  const isAuthenticated = !!identity;
  const { data: students = [], isLoading, error } = useGetAllStudents();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState<string>('all');

  const classes = useMemo(() => {
    const uniqueClasses = Array.from(new Set(students.map((s) => s.className))).sort();
    return uniqueClasses;
  }, [students]);

  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const matchesSearch =
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesClass = selectedClass === 'all' || student.className === selectedClass;
      return matchesSearch && matchesClass;
    });
  }, [students, searchTerm, selectedClass]);

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-16">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">Please log in to view the student directory.</p>
            <Button onClick={() => navigate({ to: '/' })} className="w-full">
              Go to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Users className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">Student Directory</h1>
        </div>
        <p className="text-muted-foreground">Browse and search through our student database</p>
      </div>

      {/* Search and Filter */}
      <div className="mb-6 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search by name or student ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {classes.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <Badge
              variant={selectedClass === 'all' ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => setSelectedClass('all')}
            >
              All Classes
            </Badge>
            {classes.map((className) => (
              <Badge
                key={className}
                variant={selectedClass === className ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => setSelectedClass(className)}
              >
                {className}
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {/* Error State */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>Failed to load students. Please try again later.</AlertDescription>
        </Alert>
      )}

      {/* Students List */}
      {!isLoading && !error && (
        <>
          <div className="mb-4 text-sm text-muted-foreground">
            Showing {filteredStudents.length} of {students.length} students
          </div>

          {filteredStudents.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">No students found matching your criteria.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredStudents.map((student) => (
                <Card key={student.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg text-foreground mb-1">{student.name}</h3>
                        <p className="text-sm text-muted-foreground">ID: {student.id}</p>
                      </div>
                    </div>
                    <Badge variant="secondary">{student.className}</Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
