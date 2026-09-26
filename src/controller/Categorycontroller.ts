import type { Request, Response } from "express";
import CategoryRepository from "../repositories/CategoryRepository.js";
import type { Category } from "../model/Category.js";
import { sendDatabaseError } from "../utils/httpError.js";
import {
    isNonEmptyString,
    isNonNegativeInteger,
    isOptionalBoolean,
    isOptionalString,
    isPlainObject,
    isUUID,
} from "../utils/validation.js";

type CategoryInput = Omit<Category, "id">;

type ValidationResult = {
    data: Partial<CategoryInput>;
    errors: string[];
};

// Valida o corpo da requisição e monta um objeto só com os campos permitidos.
// Na criação, "name" é obrigatório; na atualização, todos os campos são opcionais.
function validateCategory(body: unknown, isUpdate: boolean): ValidationResult {
    const errors: string[] = [];
    const data: Partial<CategoryInput> = {};

    if (!isPlainObject(body)) {
        return { data, errors: ["O corpo da requisição deve ser um objeto JSON."] };
    }

    if (body.name !== undefined || !isUpdate) {
        if (!isNonEmptyString(body.name)) {
            errors.push("O campo 'name' é obrigatório e deve ser um texto não vazio.");
        } else if (body.name.trim().length > 100) {
            errors.push("O campo 'name' deve ter no máximo 100 caracteres.");
        } else {
            data.name = body.name.trim();
        }
    }

    if (body.description !== undefined) {
        if (!isOptionalString(body.description)) {
            errors.push("O campo 'description' deve ser um texto.");
        } else {
            data.description = body.description ?? null;
        }
    }

    if (body.icon !== undefined) {
        if (!isOptionalString(body.icon)) {
            errors.push("O campo 'icon' deve ser um texto.");
        } else {
            data.icon = body.icon ?? null;
        }
    }

    if (body.display_order !== undefined) {
        if (!isNonNegativeInteger(body.display_order)) {
            errors.push("O campo 'display_order' deve ser um número inteiro maior ou igual a zero.");
        } else {
            data.display_order = body.display_order;
        }
    }

    if (body.active !== undefined) {
        if (!isOptionalBoolean(body.active)) {
            errors.push("O campo 'active' deve ser true ou false.");
        } else {
            data.active = body.active;
        }
    }

    if (isUpdate && errors.length === 0 && Object.keys(data).length === 0) {
        errors.push("Informe ao menos um campo para atualizar.");
    }

    return { data, errors };
}

async function getAll(req: Request, res: Response) {
    try {
        const categories = await CategoryRepository.findAll();

        res.status(200).json(categories);
    } catch (error) {
        sendDatabaseError(res, error, { default: "Erro ao buscar categorias." });
    }
}

async function searchbyKeyword(req: Request<{ keyword: string }>, res: Response) {
    const { keyword } = req.params;

    if (!isNonEmptyString(keyword)) {
        res.status(400).json({ message: "Palavra-chave não fornecida." });
        return;
    }

    try {
        const categories = await CategoryRepository.searchByKeyword(keyword);

        res.status(200).json(categories);
    } catch (error) {
        sendDatabaseError(res, error, { default: "Erro ao pesquisar categorias." });
    }
}

async function getById(req: Request<{ id: string }>, res: Response) {
    const { id } = req.params;

    if (!isUUID(id)) {
        res.status(400).json({ message: "ID da categoria inválido. Informe um UUID." });
        return;
    }

    try {
        const category = await CategoryRepository.findById(id);

        res.status(200).json(category);
    } catch (error) {
        sendDatabaseError(res, error, {
            default: "Erro ao buscar categoria.",
            notFound: "Categoria não encontrada.",
        });
    }
}

async function create(req: Request, res: Response) {
    const { data, errors } = validateCategory(req.body, false);

    if (errors.length > 0) {
        res.status(400).json({ message: "Dados inválidos.", errors });
        return;
    }

    try {
        const category = await CategoryRepository.create(data as CategoryInput);

        res.status(201).json(category);
    } catch (error) {
        sendDatabaseError(res, error, { default: "Erro ao criar categoria." });
    }
}

async function update(req: Request<{ id: string }>, res: Response) {
    const { id } = req.params;

    if (!isUUID(id)) {
        res.status(400).json({ message: "ID da categoria inválido. Informe um UUID." });
        return;
    }

    const { data, errors } = validateCategory(req.body, true);

    if (errors.length > 0) {
        res.status(400).json({ message: "Dados inválidos.", errors });
        return;
    }

    try {
        const category = await CategoryRepository.update(id, data);

        res.status(200).json(category);
    } catch (error) {
        sendDatabaseError(res, error, {
            default: "Erro ao atualizar categoria.",
            notFound: "Categoria não encontrada.",
        });
    }
}

async function remove(req: Request<{ id: string }>, res: Response) {
    const { id } = req.params;

    if (!isUUID(id)) {
        res.status(400).json({ message: "ID da categoria inválido. Informe um UUID." });
        return;
    }

    try {
        await CategoryRepository.remove(id);

        res.status(200).json({ message: "Categoria removida com sucesso." });
    } catch (error) {
        sendDatabaseError(res, error, {
            default: "Erro ao excluir categoria.",
            notFound: "Categoria não encontrada.",
            foreignKey: "Não é possível excluir: existem produtos vinculados a esta categoria.",
            foreignKeyStatus: 409,
        });
    }
}

export default {
    getAll,
    searchbyKeyword,
    getById,
    create,
    update,
    remove
};
