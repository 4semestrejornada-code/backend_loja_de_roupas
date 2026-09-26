export interface Category {
    id: string;
    name: string;
    description: string | null;
    icon: string | null;
    display_order: number;
    active: boolean;
}
