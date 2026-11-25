export interface IProduct {
  id: string;
  title: string;
  brand: string;
  model: string;
  description: string;
  originalPrice: number;
  discount: number;
  discountPrice: number | null;
  finalPrice: number;
  prebookPrice: number | null;
  deliveryCharge: number | null;
  condition?: string | null;
  type?: string | null;
  expiryDate?: string | null;
  ingredients?: string | null;
  nutritionInfo?: string | null;
  isDigital?: boolean;
  author?: string | null;
  publisher?: string | null;
  stock: number;
  slug: string;
  processor?: string | null;
  ram?: string | null;
  storage?: string | null;
  screenSize?: string | null;
  graphicsCard?: string | null;
  os?: string | null;
  warranty?: string | null;
  weight?: string | null;
  ratings?: number | null;
  reviewsCount?: number | null;
  mainImages: (
    | string
    | {
      id?: number;
      url: string;
    }
  )[];
  features: Record<string, string>;
  categoryId: string;
  categoryIds?: string[];
  subCategoryId?: string | null;
  nestedSubCategoryId?: string | null;
  brandId?: string | null;
  isDelete: boolean;
  isPublish: boolean;
  isColorVariant: boolean;
  createdAt: string;
  updatedAt: string;
  category: {
    id: string;
    name: string;
    slug: string;
  };
  subCategory?: {
    id: string;
    name: string;
    slug: string;
  };
  nestedSubCategory?: {
    id: string;
    name: string;
    slug: string;
  };
  brands: {
    id: string;
    title: string;
    slug: string;
  }[];
  brandEntity?: {
    id: string;
    title: string;
    slug: string;
  };
}
