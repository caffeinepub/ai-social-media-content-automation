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
export interface ScheduledPost {
    status: PostStatus;
    scheduledTime: Time;
    post: SocialPost;
    brandId: string;
}
export interface Product {
    name: string;
    description: string;
    category: string;
}
export type Time = bigint;
export interface BrandProfile {
    categories: Array<string>;
    logo: ExternalBlob;
    name: string;
    tone: string;
    audience: string;
    catalog: Array<Product>;
}
export interface SocialPost {
    hashtags: Array<string>;
    platform: string;
    caption: string;
    image?: ExternalBlob;
    product: Product;
}
export interface UserProfile {
    name: string;
}
export enum PostStatus {
    scheduled = "scheduled",
    published = "published",
    draft = "draft"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addProduct(brandId: string, product: Product): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createBrandProfile(brandId: string, name: string, logo: ExternalBlob, tone: string, audience: string, categories: Array<string>): Promise<void>;
    deleteScheduledPost(postId: string): Promise<void>;
    generatePost(brandId: string, productIdx: bigint, platform: string): Promise<SocialPost>;
    getBrandProfile(brandId: string): Promise<BrandProfile | null>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getScheduledPosts(brandId: string): Promise<Array<ScheduledPost>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    schedulePost(brandId: string, post: SocialPost, scheduledTime: Time): Promise<string>;
    updatePostStatus(postId: string, status: PostStatus): Promise<void>;
}
