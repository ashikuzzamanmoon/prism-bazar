export interface ISubCategory {
    id: string;
    name: string;
    slug?: string;
}

export interface ICategory {
    id: string;
    name: string;
    slug: string;
    subCategories: ISubCategory[];
}

export interface ICollection {
    id: string;
    name: string;
    slug: string;
    categories: ICategory[];
}