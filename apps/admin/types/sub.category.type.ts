export interface ISubCategory {
    id: string;
    name: string;
    slug: string;
    image: string | null;
    description: string;
    categoryId: string | null; // parentId (can be null for root)
    isDelete: boolean;
    createdAt: string;
    updatedAt: string;

    // Parent reference (optional)
    category?: {
        id: string;
        name: string;
    };

    // Children subcategories (recursive)
    children?: ISubCategory[];
}
