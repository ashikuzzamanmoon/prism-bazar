import { ProductFormData, ProductValidationErrors } from "@/types/product.create.type"

export function validateProductForm(data: ProductFormData): ProductValidationErrors {
    const errors: ProductValidationErrors = {}

    // Required field validations
    if (!data.title.trim()) {
        errors.title = "Product title is required"
    } else if (data.title.length < 3) {
        errors.title = "Product title must be at least 3 characters"
    }

    if (!data.brand.trim()) {
        errors.brand = "Brand is required"
    } else if (data.brand.length < 2) {
        errors.brand = "Brand must be at least 2 characters"
    }

    if (!data.model.trim()) {
        errors.model = "Model is required"
    } else if (data.model.length < 2) {
        errors.model = "Model must be at least 2 characters"
    }

    if (!data.description.trim()) {
        errors.description = "Description is required"
    } else if (data.description.length < 10) {
        errors.description = "Description must be at least 10 characters"
    } else if (data.description.length > 1000) {
        errors.description = "Description must not exceed 1000 characters"
    }

    if (!data.originalPrice || data.originalPrice <= 0) {
        errors.originalPrice = "Original price must be greater than 0"
    }

    if (data.discount !== undefined && data.discount !== null) {
        if (data.discount < 0) {
            errors.discount = "Discount price cannot be negative"
        }
    }

    if (!data.finalPrice || data.finalPrice <= 0) {
        errors.finalPrice = "Final price must be greater than 0"
    } else if (data.finalPrice > data.originalPrice) {
        errors.finalPrice = "Final price cannot be greater than original price"
    }

    if (data.prebookPrice !== undefined && data.prebookPrice !== null && data.prebookPrice < 0) {
        errors.prebookPrice = "Prebook price cannot be negative"
    }

    if (data.stock == null) {
        errors.stock = "Stock is required"
    } else if (data.stock < 0) {
        errors.stock = "Stock must be 0 or greater"
    }


    if (!data.slug.trim()) {
        errors.slug = "Slug is required"
    } else if (!/^[a-z0-9-]+$/.test(data.slug)) {
        errors.slug = "Slug can only contain lowercase letters, numbers, and hyphens"
    }

    if (data.ratings !== undefined && data.ratings !== null) {
        if (data.ratings < 0 || data.ratings > 5) {
            errors.ratings = "Ratings must be between 0 and 5"
        }
    }

    if (data.reviewsCount !== undefined && data.reviewsCount !== null && data.reviewsCount < 0) {
        errors.reviewsCount = "Reviews count cannot be negative"
    }

    return errors
}

