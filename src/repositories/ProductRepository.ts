import supabase from "../config/supabase.js";
import type { Product } from "../model/Product.js";

async function findAll() {
    const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("name", { ascending: true });

    if (error) {
        throw error;
    }

    return data;
}

async function findById(id: string) {
    const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .single();

    if (error) {
        throw error;
    }

    return data;
}

// A coluna "title" da tabela products é mantida igual a "name"
// para manter compatibilidade com a estrutura original do banco.
async function create(product: Omit<Product, "id">) {
    const { data, error } = await supabase
        .from("products")
        .insert({ ...product, title: product.name })
        .select()
        .single();

    if (error) {
        throw error;
    }

    return data;
}

async function update(
    id: string,
    product: Partial<Omit<Product, "id">>
) {
    const payload: typeof product & { title?: string } = { ...product };

    if (product.name !== undefined) {
        payload.title = product.name;
    }

    const { data, error } = await supabase
        .from("products")
        .update(payload)
        .eq("id", id)
        .select()
        .single();

    if (error) {
        throw error;
    }

    return data;
}

async function remove(id: string) {
    const { data, error } = await supabase
        .from("products")
        .delete()
        .eq("id", id)
        .select()
        .single();

    if (error) {
        throw error;
    }

    return data;
}

export default {
    findAll,
    findById,
    create,
    update,
    remove
};
