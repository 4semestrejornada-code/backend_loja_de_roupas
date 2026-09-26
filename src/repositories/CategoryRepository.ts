import supabase from "../config/supabase.js";
import type { Category } from "../model/Category.js";

async function findAll() {
    const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("display_order", { ascending: true });

    if (error) {
        throw error;
    }

    return data;
}

async function findById(id: string) {
    const { data, error } = await supabase
        .from("categories")
        .select("*")
        .eq("id", id)
        .single();

    if (error) {
        throw error;
    }

    return data;
}

async function create(category: Omit<Category, "id">) {
    const { data, error } = await supabase
        .from("categories")
        .insert(category)
        .select()
        .single();

    if (error) {
        throw error;
    }

    return data;
}

async function update(
    id: string,
    category: Partial<Omit<Category, "id">>
) {
    const { data, error } = await supabase
        .from("categories")
        .update(category)
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
        .from("categories")
        .delete()
        .eq("id", id)
        .select()
        .single();

    if (error) {
        throw error;
    }

    return data;
}

async function searchByKeyword(keyword: string) {
    // Remove caracteres que quebrariam o filtro .or() do Supabase
    const term = keyword.replace(/[,()%*]/g, " ").trim();

    const { data, error } = await supabase
        .from("categories")
        .select("*")
        .or(`name.ilike.%${term}%,description.ilike.%${term}%`)
        .order("display_order", { ascending: true });

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
    remove,
    searchByKeyword
};
