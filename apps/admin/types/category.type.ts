export interface SubCategory {
    id: string;
    name: string;
    title: string,
    image: string
}

export interface ICategory {
    id: string;
    name: string;
    slug: string;
    image: string;
    order: number;
    description: string;
    type: "CATEGORY" | "BRAND";
    createdAt: string;
    updatedAt: string;
    subCategories: SubCategory[];
}
