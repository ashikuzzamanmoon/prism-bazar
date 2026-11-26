export type ProductCondition =
  | "BRAND_NEW"
  | "PRE_OWNED"
  | "FRESH"
  | "PACKAGED"
  | "HANDMADE"
  | "PRINTED"
  | "DIGITAL";

export type ProductType =
  | "ORGANIC_FOOD"
  | "EDUCATION_MATERIAL"
  | "GENERAL"
  | "ACCESSORY";

export type FeatureType = "HIGHLIGHT" | "SPECIFICATION";

export interface IProductImage {
  id: string;
  url: string;
  altText: string | null;
  isPrimary: boolean;
  sortOrder: number;
}

export interface IColorImage {
  id: string;
  url: string;
  isPrimary: boolean;
}

export interface IProductFeature {
  id: string;
  title: string;
  image: string | null;
  type: FeatureType;
  sortOrder: number;
  features?: { id: number | string; key: string; value: string }[];
}

export interface IProductColor {
  id: string;
  name: string;
  hexCode: string;
  stock: number;
  basePrice: string;
  isPublish: boolean;
  images: IColorImage[];
}

/* ================================
   OPTION TYPES
================================ */

export interface IProductOption {
  id: string;
  value: string;
  extraPrice: string;
  isPublish: boolean;
}

export interface IProductOptionGroup {
  id: string;
  title: string;
  type: string;
  isPublish: boolean;
  options: IProductOption[];
}

export interface IProduct {
  id: string;
  slug: string;
  title: string;
  modelNumber: string;
  description: string;
  price: string;
  basePrice: string;
  discount: number;
  prebookPrice: string;
  deliveryCharge: string;
  ratings: number;
  reviewsCount: number;

  condition: ProductCondition;
  type: ProductType;
  isPublish: boolean;

  expiryDate?: string | null;
  ingredients?: string | null;
  nutritionInfo?: string | null;
  isDigital?: boolean;
  author?: string | null;
  publisher?: string | null;

  createdAt: string;
  updatedAt: string;

  features?: { id: number | string; key: string; value: string }[];

  brand?: any;
  productCategories?: any[];
  productCollections?: any[];

  productImages: IProductImage[];
  productFeatures: IProductFeature[];
  productColors: IProductColor[];
  productOptionGroups: IProductOptionGroup[];
}
