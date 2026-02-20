import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface UserProfile {
    studentId?: string;
    name: string;
    role: string;
    photo: ExternalBlob;
}
export type Time = bigint;
export interface ContactForm {
    id: bigint;
    status: ContactStatus;
    studentId?: string;
    subject: string;
    message: string;
    timestamp: Time;
    senderName: string;
    senderEmail: string;
}
export interface Event {
    id: bigint;
    title: string;
    date: Time;
    description: string;
}
export interface PaymentTransaction {
    id: bigint;
    paymentMethod: string;
    studentId: string;
    paymentDate: Time;
    amount: bigint;
    transactionId: string;
    feeId: bigint;
}
export interface TeacherProfile {
    id: string;
    contactInfo: string;
    subjects: Array<string>;
    officeHours: string;
    name: string;
    qualifications: string;
    photo: ExternalBlob;
}
export interface ClassSchedule {
    section: string;
    grade: string;
    schedule: Array<string>;
}
export interface PhotoRecord {
    id: bigint;
    title: string;
    description: string;
    timestamp: Time;
    category: PhotoCategory;
    image: ExternalBlob;
    uploadedBy: string;
}
export interface FeeRecord {
    id: bigint;
    status: FeeStatus;
    studentId: string;
    feeType: string;
    dueDate: Time;
    description: string;
    paidDate?: Time;
    paidAmount: bigint;
    amount: bigint;
}
export interface BorrowingRecord {
    id: bigint;
    status: BorrowStatus;
    studentId: string;
    borrowDate: Time;
    dueDate: Time;
    bookId: bigint;
    returnDate?: Time;
}
export interface Book {
    id: bigint;
    title: string;
    availableCopies: bigint;
    thumbnail: ExternalBlob;
    isbn: string;
    author: string;
    totalCopies: bigint;
    category: string;
}
export interface Announcement {
    id: bigint;
    title: string;
    content: string;
    timestamp: Time;
}
export interface ExamResult {
    studentId: string;
    subject: string;
    grade: string;
    examDate: Time;
    examName: string;
    remarks: string;
    percentage: bigint;
}
export interface Student {
    id: string;
    name: string;
    photo: ExternalBlob;
    className: string;
}
export enum BorrowStatus {
    borrowed = "borrowed",
    overdue = "overdue",
    returned = "returned"
}
export enum ContactStatus {
    new_ = "new",
    read = "read",
    replied = "replied"
}
export enum FeeStatus {
    pending = "pending",
    paid = "paid",
    overdue = "overdue",
    partial = "partial"
}
export enum PhotoCategory {
    achievements = "achievements",
    events = "events",
    facilities = "facilities",
    general = "general"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addAnnouncement(title: string, content: string): Promise<void>;
    addBook(book: Book): Promise<void>;
    addClassSchedule(section: string, grade: string, schedule: Array<string>): Promise<void>;
    addEvent(title: string, description: string, date: Time): Promise<void>;
    addExamResult(result: ExamResult): Promise<void>;
    addFeeRecord(record: FeeRecord): Promise<void>;
    addPhotoRecord(record: PhotoRecord): Promise<void>;
    addStudent(student: Student): Promise<void>;
    addTeacherProfile(profile: TeacherProfile): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    borrowBook(bookId: bigint, studentId: string, dueDate: Time): Promise<void>;
    deleteContactForm(id: bigint): Promise<void>;
    getActiveBorrowings(): Promise<Array<BorrowingRecord>>;
    getAllAnnouncements(): Promise<Array<Announcement>>;
    getAllBooks(): Promise<Array<Book>>;
    getAllBorrowingRecords(): Promise<Array<BorrowingRecord>>;
    getAllClassSchedules(): Promise<Array<ClassSchedule>>;
    getAllContactForms(): Promise<Array<ContactForm>>;
    getAllEvents(): Promise<Array<Event>>;
    getAllExamResults(): Promise<Array<ExamResult>>;
    getAllFeeRecords(): Promise<Array<FeeRecord>>;
    getAllPaymentTransactions(): Promise<Array<PaymentTransaction>>;
    getAllPhotoRecords(): Promise<Array<PhotoRecord>>;
    getAllStudents(): Promise<Array<Student>>;
    getAllTeacherProfiles(): Promise<Array<TeacherProfile>>;
    getAvailableBooks(): Promise<Array<Book>>;
    getBooksByCategory(category: string): Promise<Array<Book>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getClassSchedulesByGrade(grade: string): Promise<Array<ClassSchedule>>;
    getContactFormsByStatus(status: ContactStatus): Promise<Array<ContactForm>>;
    getPhotoRecordsByCategory(category: PhotoCategory): Promise<Array<PhotoRecord>>;
    getStudentBorrowingHistory(studentId: string): Promise<Array<BorrowingRecord>>;
    getStudentExamResults(studentId: string): Promise<Array<ExamResult>>;
    getStudentFeeRecords(studentId: string): Promise<Array<FeeRecord>>;
    getStudentPaymentHistory(studentId: string): Promise<Array<PaymentTransaction>>;
    getStudentsByClass(className: string): Promise<Array<Student>>;
    getStudentsById(): Promise<Array<Student>>;
    getStudentsByName(): Promise<Array<Student>>;
    getTeacherProfile(id: string): Promise<TeacherProfile | null>;
    getTeacherProfilesBySubject(subject: string): Promise<Array<TeacherProfile>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    recordPayment(transaction: PaymentTransaction): Promise<void>;
    removeAnnouncement(id: bigint): Promise<void>;
    removeBook(id: bigint): Promise<void>;
    removeClassSchedule(section: string): Promise<void>;
    removeEvent(id: bigint): Promise<void>;
    removeExamResult(studentId: string, examName: string): Promise<void>;
    removeFeeRecord(id: bigint): Promise<void>;
    removePhotoRecord(id: bigint): Promise<void>;
    removeStudent(id: string): Promise<void>;
    removeTeacherProfile(id: string): Promise<void>;
    returnBook(borrowingId: bigint): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    submitContactForm(form: ContactForm): Promise<void>;
    updateBook(book: Book): Promise<void>;
    updateBorrowingStatus(borrowingId: bigint, status: BorrowStatus): Promise<void>;
    updateContactStatus(id: bigint, status: ContactStatus): Promise<void>;
    updateExamResult(result: ExamResult): Promise<void>;
    updateFeeRecord(record: FeeRecord): Promise<void>;
    updatePhotoRecord(record: PhotoRecord): Promise<void>;
    updateTeacherProfile(profile: TeacherProfile): Promise<void>;
}
