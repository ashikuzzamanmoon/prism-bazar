export interface ProductImage {
  id: string
  url: string
  altText: string | null
  isPrimary: boolean
}

export interface ProductColor {
  id: string
  name: string
  hexCode: string
  stock: number
  basePrice: string
  isPublish: boolean
}

export interface Product {
  id: string
  slug: string
  title: string
  price: string
  basePrice: string
  discount: number
  condition: string
  isPublish: boolean
  productImages: ProductImage[]
  productColors: ProductColor[]
}

export interface ProductsResponse {
  data: Product[]
  meta: {
    total: number
    page: number
    limit: number
  }
}