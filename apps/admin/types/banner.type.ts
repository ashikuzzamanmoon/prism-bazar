export type BannerType = "IMAGE" | "VIDEO";

export interface IBanner {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  image?: string;
  video?: string;
  type: BannerType;
  link: string | null;
  isDelete: boolean;
  isPublish: boolean;
  isSide: boolean;
  createdAt: string;
  updatedAt: string;
}
