export interface ProductFormData {
    title: string
    brand: string
    model: string
    description: string
    originalPrice: number
    discount?: number
    finalPrice: number
    prebookPrice?: number
    deliveryCharge?: number
    condition?: string
    type?: string
    stock: number
    slug: string
    expiryDate?: string
    ingredients?: string
    nutritionInfo?: string
    isDigital?: boolean
    author?: string
    publisher?: string
    processor?: string
    ram?: string
    storage?: string
    screenSize?: string
    graphicsCard?: string
    os?: string
    warranty?: string
    weight?: string
    features?: Record<string, any>
    ratings?: number
    reviewsCount?: number
    isPublish: boolean
    productFeatures?: any
}

export interface ProductValidationErrors {
    title?: string
    brand?: string
    model?: string
    description?: string
    originalPrice?: string
    discount?: string
    finalPrice?: string
    prebookPrice?: string
    stock?: string
    slug?: string
    processor?: string
    ram?: string
    storage?: string
    screenSize?: string
    graphicsCard?: string
    os?: string
    warranty?: string
    weight?: string
    features?: string
    ratings?: string
    reviewsCount?: string
    isPublish?: string
    [key: string]: string | any
}



