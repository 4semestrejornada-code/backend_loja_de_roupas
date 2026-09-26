export interface Product {
    id: string;
    category_id: string;
    name: string;
    description: string | null;
    price: number;
    image_url?: string | null;
    available: boolean;
    active: boolean;
}
