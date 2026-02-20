import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type {
  Student,
  Announcement,
  ClassSchedule,
  Event,
  UserProfile,
  PhotoRecord,
  PhotoCategory,
  TeacherProfile,
  ExamResult,
  Book,
  BorrowingRecord,
  BorrowStatus,
  FeeRecord,
  PaymentTransaction,
  ContactForm,
  ContactStatus,
} from '../backend';

// User Profile Queries
export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

export function useIsCallerAdmin() {
  const { actor, isFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['isCallerAdmin'],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

// Student Queries
export function useGetAllStudents() {
  const { actor, isFetching } = useActor();

  return useQuery<Student[]>({
    queryKey: ['students'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllStudents();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetStudentsByClass(className: string) {
  const { actor, isFetching } = useActor();

  return useQuery<Student[]>({
    queryKey: ['students', 'class', className],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getStudentsByClass(className);
    },
    enabled: !!actor && !isFetching && !!className,
  });
}

// Announcement Queries
export function useGetAllAnnouncements() {
  const { actor, isFetching } = useActor();

  return useQuery<Announcement[]>({
    queryKey: ['announcements'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllAnnouncements();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddAnnouncement() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ title, content }: { title: string; content: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addAnnouncement(title, content);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
    },
  });
}

// Class Schedule Queries
export function useGetAllClassSchedules() {
  const { actor, isFetching } = useActor();

  return useQuery<ClassSchedule[]>({
    queryKey: ['classSchedules'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllClassSchedules();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetClassSchedulesByGrade(grade: string) {
  const { actor, isFetching } = useActor();

  return useQuery<ClassSchedule[]>({
    queryKey: ['classSchedules', 'grade', grade],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getClassSchedulesByGrade(grade);
    },
    enabled: !!actor && !isFetching && !!grade,
  });
}

// Event Queries
export function useGetAllEvents() {
  const { actor, isFetching } = useActor();

  return useQuery<Event[]>({
    queryKey: ['events'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllEvents();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddEvent() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      title,
      description,
      date,
    }: {
      title: string;
      description: string;
      date: bigint;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addEvent(title, description, date);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });
}

// Photo Gallery Queries
export function useGetPhotoRecordsByCategory(category: PhotoCategory) {
  const { actor, isFetching } = useActor();

  return useQuery<PhotoRecord[]>({
    queryKey: ['photos', category],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getPhotoRecordsByCategory(category);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetAllPhotoRecords() {
  const { actor, isFetching } = useActor();

  return useQuery<PhotoRecord[]>({
    queryKey: ['photos'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllPhotoRecords();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddPhotoRecord() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (record: PhotoRecord) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addPhotoRecord(record);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['photos'] });
    },
  });
}

export function useUpdatePhotoRecord() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (record: PhotoRecord) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updatePhotoRecord(record);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['photos'] });
    },
  });
}

export function useRemovePhotoRecord() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.removePhotoRecord(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['photos'] });
    },
  });
}

// Teacher Profile Queries
export function useGetAllTeacherProfiles() {
  const { actor, isFetching } = useActor();

  return useQuery<TeacherProfile[]>({
    queryKey: ['teachers'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllTeacherProfiles();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetTeacherProfile(id: string) {
  const { actor, isFetching } = useActor();

  return useQuery<TeacherProfile | null>({
    queryKey: ['teacher', id],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getTeacherProfile(id);
    },
    enabled: !!actor && !isFetching && !!id,
  });
}

export function useAddTeacherProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: TeacherProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addTeacherProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teachers'] });
    },
  });
}

export function useUpdateTeacherProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: TeacherProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateTeacherProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teachers'] });
    },
  });
}

export function useRemoveTeacherProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.removeTeacherProfile(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teachers'] });
    },
  });
}

// Exam Results Queries
export function useGetStudentExamResults(studentId: string) {
  const { actor, isFetching } = useActor();

  return useQuery<ExamResult[]>({
    queryKey: ['examResults', studentId],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getStudentExamResults(studentId);
    },
    enabled: !!actor && !isFetching && !!studentId,
  });
}

export function useGetAllExamResults() {
  const { actor, isFetching } = useActor();

  return useQuery<ExamResult[]>({
    queryKey: ['examResults'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllExamResults();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddExamResult() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (result: ExamResult) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addExamResult(result);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['examResults'] });
    },
  });
}

export function useUpdateExamResult() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (result: ExamResult) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateExamResult(result);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['examResults'] });
    },
  });
}

export function useRemoveExamResult() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ studentId, examName }: { studentId: string; examName: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.removeExamResult(studentId, examName);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['examResults'] });
    },
  });
}

// Library Queries
export function useGetAllBooks() {
  const { actor, isFetching } = useActor();

  return useQuery<Book[]>({
    queryKey: ['books'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllBooks();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetAvailableBooks() {
  const { actor, isFetching } = useActor();

  return useQuery<Book[]>({
    queryKey: ['books', 'available'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAvailableBooks();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetStudentBorrowingHistory(studentId: string) {
  const { actor, isFetching } = useActor();

  return useQuery<BorrowingRecord[]>({
    queryKey: ['borrowing', studentId],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getStudentBorrowingHistory(studentId);
    },
    enabled: !!actor && !isFetching && !!studentId,
  });
}

export function useGetAllBorrowingRecords() {
  const { actor, isFetching } = useActor();

  return useQuery<BorrowingRecord[]>({
    queryKey: ['borrowing'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllBorrowingRecords();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddBook() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (book: Book) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addBook(book);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['books'] });
    },
  });
}

export function useUpdateBook() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (book: Book) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateBook(book);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['books'] });
    },
  });
}

export function useRemoveBook() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.removeBook(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['books'] });
    },
  });
}

export function useBorrowBook() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      bookId,
      studentId,
      dueDate,
    }: {
      bookId: bigint;
      studentId: string;
      dueDate: bigint;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.borrowBook(bookId, studentId, dueDate);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['books'] });
      queryClient.invalidateQueries({ queryKey: ['borrowing'] });
    },
  });
}

export function useReturnBook() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (borrowingId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.returnBook(borrowingId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['books'] });
      queryClient.invalidateQueries({ queryKey: ['borrowing'] });
    },
  });
}

export function useUpdateBorrowingStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ borrowingId, status }: { borrowingId: bigint; status: BorrowStatus }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateBorrowingStatus(borrowingId, status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['borrowing'] });
    },
  });
}

// Fee Payment Queries
export function useGetStudentFeeRecords(studentId: string) {
  const { actor, isFetching } = useActor();

  return useQuery<FeeRecord[]>({
    queryKey: ['fees', studentId],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getStudentFeeRecords(studentId);
    },
    enabled: !!actor && !isFetching && !!studentId,
  });
}

export function useGetAllFeeRecords() {
  const { actor, isFetching } = useActor();

  return useQuery<FeeRecord[]>({
    queryKey: ['fees'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllFeeRecords();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetStudentPaymentHistory(studentId: string) {
  const { actor, isFetching } = useActor();

  return useQuery<PaymentTransaction[]>({
    queryKey: ['payments', studentId],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getStudentPaymentHistory(studentId);
    },
    enabled: !!actor && !isFetching && !!studentId,
  });
}

export function useGetAllPaymentTransactions() {
  const { actor, isFetching } = useActor();

  return useQuery<PaymentTransaction[]>({
    queryKey: ['payments'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllPaymentTransactions();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddFeeRecord() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (record: FeeRecord) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addFeeRecord(record);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fees'] });
    },
  });
}

export function useUpdateFeeRecord() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (record: FeeRecord) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateFeeRecord(record);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fees'] });
    },
  });
}

export function useRemoveFeeRecord() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.removeFeeRecord(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fees'] });
    },
  });
}

export function useRecordPayment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (transaction: PaymentTransaction) => {
      if (!actor) throw new Error('Actor not available');
      return actor.recordPayment(transaction);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fees'] });
      queryClient.invalidateQueries({ queryKey: ['payments'] });
    },
  });
}

// Contact Form Queries
export function useSubmitContactForm() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (form: ContactForm) => {
      if (!actor) throw new Error('Actor not available');
      return actor.submitContactForm(form);
    },
  });
}

export function useGetAllContactForms() {
  const { actor, isFetching } = useActor();

  return useQuery<ContactForm[]>({
    queryKey: ['contactForms'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllContactForms();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetContactFormsByStatus(status: ContactStatus) {
  const { actor, isFetching } = useActor();

  return useQuery<ContactForm[]>({
    queryKey: ['contactForms', status],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getContactFormsByStatus(status);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useUpdateContactStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: bigint; status: ContactStatus }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateContactStatus(id, status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contactForms'] });
    },
  });
}

export function useDeleteContactForm() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteContactForm(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contactForms'] });
    },
  });
}
