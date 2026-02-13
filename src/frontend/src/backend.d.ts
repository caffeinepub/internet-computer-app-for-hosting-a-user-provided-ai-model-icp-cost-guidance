import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type ModelId = string;
export type ModelInferenceArtifact = Uint8Array;
export interface ModelMetadataUpdate {
    id: ModelId;
    name: string;
    artifact?: ModelInferenceArtifact;
    payloadSize: bigint;
}
export interface Model {
    id: ModelId;
    totalInferenceCount: bigint;
    owner: Principal;
    name: string;
    artifact?: ModelInferenceArtifact;
    lastInferenceTime: bigint;
    timestamp: bigint;
    payloadSize: bigint;
}
export interface UserProfile {
    name: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    deleteModel(modelId: ModelId): Promise<void>;
    getAdminModels(): Promise<Array<Model>>;
    getAvailableModels(): Promise<Array<Model>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getFundingStatus(): Promise<{
        topUpAccount?: string;
        depositInstructions: string;
    }>;
    getModelById(modelId: ModelId): Promise<Model | null>;
    getModelStats(): Promise<{
        totalInferenceCount: bigint;
        totalStorageUsed: bigint;
        totalModels: bigint;
        totalUsers: bigint;
    }>;
    getMostPopularModels(limit: bigint): Promise<Array<Model>>;
    getMyModels(): Promise<Array<Model>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    updateModelMetadata(modelUpdate: ModelMetadataUpdate): Promise<void>;
}
