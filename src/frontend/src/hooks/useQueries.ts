import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { Student, Announcement, ClassSchedule, Event, UserProfile } from '../backend';

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
