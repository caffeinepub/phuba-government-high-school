import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type Time = bigint;
export interface Event {
    id: bigint;
    title: string;
    date: Time;
    description: string;
}
export interface Announcement {
    id: bigint;
    title: string;
    content: string;
    timestamp: Time;
}
export interface ClassSchedule {
    section: string;
    grade: string;
    schedule: Array<string>;
}
export interface UserProfile {
    name: string;
    role: string;
}
export interface Student {
    id: string;
    name: string;
    className: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addAnnouncement(title: string, content: string): Promise<void>;
    addClassSchedule(section: string, grade: string, schedule: Array<string>): Promise<void>;
    addEvent(title: string, description: string, date: Time): Promise<void>;
    addStudent(student: Student): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    getAllAnnouncements(): Promise<Array<Announcement>>;
    getAllClassSchedules(): Promise<Array<ClassSchedule>>;
    getAllEvents(): Promise<Array<Event>>;
    getAllStudents(): Promise<Array<Student>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getClassSchedulesByGrade(grade: string): Promise<Array<ClassSchedule>>;
    getStudentsByClass(className: string): Promise<Array<Student>>;
    getStudentsById(): Promise<Array<Student>>;
    getStudentsByName(): Promise<Array<Student>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    removeAnnouncement(id: bigint): Promise<void>;
    removeClassSchedule(section: string): Promise<void>;
    removeEvent(id: bigint): Promise<void>;
    removeStudent(id: string): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
}
