export interface SubCategory {
  id: string
  name: string
  slug: string
}

export interface Category {
  id: string
  name: string
  slug: string
  subCategories: SubCategory[]
}

export interface Collection {
  id: string
  name: string
  slug: string
  categories: Category[]
}

export interface FilterParams {
  collection?: string   
  category?: string
  subCategory?: string
  brand?: string
  minPrice?: string
  maxPrice?: string
  sortByPrice?: string
  searchTerm?: string;
  page?: string
}

export interface Brand {
  id: string
  title: string
  slug: string
  image: string
  isPublish: boolean
  isDelete: boolean
}