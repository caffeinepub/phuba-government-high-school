import { useState, useMemo } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetAllClassSchedules, useIsCallerAdmin } from '../hooks/useQueries';
import { Clock, Loader2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useNavigate } from '@tanstack/react-router';

export default function ClassSchedulePage() {
  const { identity } = useInternetIdentity();
  const navigate = useNavigate();
  const isAuthenticated = !!identity;
  const { data: schedules = [], isLoading, error } = useGetAllClassSchedules();
  const { data: isAdmin = false } = useIsCallerAdmin();
  const [selectedGrade, setSelectedGrade] = useState<string>('all');

  const grades = useMemo(() => {
    const uniqueGrades = Array.from(new Set(schedules.map((s) => s.grade))).sort();
    return uniqueGrades;
  }, [schedules]);

  const filteredSchedules = useMemo(() => {
    if (selectedGrade === 'all') return schedules;
    return schedules.filter((schedule) => schedule.grade === selectedGrade);
  }, [schedules, selectedGrade]);

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-16">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">Please log in to view class schedules.</p>
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
          <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-950 flex items-center justify-center">
            <Clock className="w-6 h-6 text-green-600 dark:text-green-400" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">Class Schedules</h1>
        </div>
        <p className="text-muted-foreground">View class schedules organized by grade and section</p>
      </div>

      {/* Grade Filter */}
      {grades.length > 0 && (
        <div className="mb-6 flex flex-wrap gap-2">
          <Badge
            variant={selectedGrade === 'all' ? 'default' : 'outline'}
            className="cursor-pointer"
            onClick={() => setSelectedGrade('all')}
          >
            All Grades
          </Badge>
          {grades.map((grade) => (
            <Badge
              key={grade}
              variant={selectedGrade === grade ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => setSelectedGrade(grade)}
            >
              Grade {grade}
            </Badge>
          ))}
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {/* Error State */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>Failed to load schedules. Please try again later.</AlertDescription>
        </Alert>
      )}

      {/* Schedules List */}
      {!isLoading && !error && (
        <>
          {filteredSchedules.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No schedules available.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSchedules.map((schedule, index) => (
                <Card key={`${schedule.grade}-${schedule.section}-${index}`} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <CardTitle className="text-xl">
                        Grade {schedule.grade} - {schedule.section}
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {schedule.schedule.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No schedule entries</p>
                      ) : (
                        schedule.schedule.map((entry, idx) => (
                          <div
                            key={idx}
                            className="p-3 rounded-md bg-muted/50 text-sm border border-border/50"
                          >
                            {entry}
                          </div>
                        ))
                      )}
                    </div>
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
