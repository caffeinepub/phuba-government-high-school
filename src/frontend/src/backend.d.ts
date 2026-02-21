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
export interface Poem {
    id: bigint;
    title: string;
    createdBy: Principal;
    culturalContext?: string;
    poemText: string;
    author: string;
    timestamp: bigint;
    category: string;
    dateWritten: string;
    englishTranslation?: string;
}
export interface UserProfile {
    studentId?: string;
    name: string;
    photo: ExternalBlob;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createPoem(title: string, author: string, poemText: string, dateWritten: string, category: string, englishTranslation: string | null, culturalContext: string | null): Promise<void>;
    deletePoem(id: bigint): Promise<void>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getPoem(id: bigint): Promise<Poem | null>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    listPoems(): Promise<Array<Poem>>;
    listPoemsByCategory(category: string): Promise<Array<Poem>>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    updatePoem(id: bigint, title: string, author: string, poemText: string, dateWritten: string, category: string, englishTranslation: string | null, culturalContext: string | null): Promise<void>;
}
