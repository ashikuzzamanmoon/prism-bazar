export interface UserProfile {
    id: string;
    name: string;
    phone: string | null;
    photo: string | null;
    coverLetter: string | null;
    bannerImages: string | null;
    country: string | null;
    city: string | null;
    address: string | null;
    gender: string | null;
    birthDate: string;
    totalOrders: number;
    active: boolean;
    type: string;
    userId: string;
    createdAt: string;
    updatedAt: string;
}

export interface IUser {
    id: string;
    name: string;
    email: string;
    password: string;
    role: "USER" | "ADMIN";
    status: "ACTIVE" | "INACTIVE";
    isDeleted: boolean;
    createdAt: string;
    updatedAt: string;
    profile: UserProfile;
}

