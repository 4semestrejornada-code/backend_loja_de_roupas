import type { Request, Response } from "express";
import ProductRepository from "../repositories/ProductRepository.js";
import type { Product } from "../model/Product.js";
import { sendDatabaseError } from "../utils/httpError.js";
import {
    isNonEmptyString,
    isNonNegativeNumber,
    isOptionalBoolean,
    isOptionalString,
    isPlainObject,
    isUUID,
} from "../utils/validation.js";

type ProductInput = Omit<Product, "id">;

type ValidationResult = {
    data: Partial<ProductInput>;
    errors: string[];
};

// Valida o corpo da requisição e monta um objeto só com os campos permitidos.
// Na criação, "category_id", "name" e "price" são obrigatórios; na atualização, todos são opcionais.
function validateProduct(body: unknown, isUpdate: boolean): ValidationResult {
    const errors: string[] = [];
    const data: Partial<ProductInput> = {};

    if (!isPlainObject(body)) {
        return { data, errors: ["O corpo da requisição deve ser um objeto JSON."] };
    }

    if (body.category_id !== undefined || !isUpdate) {
        if (!isUUID(body.category_id)) {
            errors.push("O campo 'category_id' é obrigatório e deve ser um UUID válido.");
        } else {
            data.category_id = body.category_id;
        }
    }

    if (body.name !== undefined || !isUpdate) {
        if (!isNonEmptyString(body.name)) {
            errors.push("O campo 'name' é obrigatório e deve ser um texto não vazio.");
        } else if (body.name.trim().length > 150) {
            errors.push("O campo 'name' deve ter no máximo 150 caracteres.");
        } else {
            data.name = body.name.trim();
        }
    }

    if (body.price !== undefined || !isUpdate) {
        if (!isNonNegativeNumber(body.price)) {
            errors.push("O campo 'price' é obrigatório e deve ser um número maior ou igual a zero.");
        } else {
            data.price = body.price;
        }
    }

    if (body.description !== undefined) {
        if (!isOptionalString(body.description)) {
            errors.push("O campo 'description' deve ser um texto.");
        } else {
            data.description = body.description ?? null;
        }
    }

    if (body.image_url !== undefined) {
        if (!isOptionalString(body.image_url)) {
            errors.push("O campo 'image_url' deve ser um texto (URL da imagem).");
        } else {
            // Texto vazio é gravado como "sem imagem"
            data.image_url = body.image_url?.trim() ? body.image_url.trim() : null;
        }
    }

    if (body.available !== undefined) {
        if (!isOptionalBoolean(body.available)) {
            errors.push("O campo 'available' deve ser true ou false.");
        } else {
            data.available = body.available;
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
        const products = await ProductRepository.findAll();

        res.status(200).json(products);
    } catch (error) {
        sendDatabaseError(res, error, { default: "Erro ao buscar produtos." });
    }
}

async function getById(req: Request<{ id: string }>, res: Response) {
    const { id } = req.params;

    if (!isUUID(id)) {
        res.status(400).json({ message: "ID do produto inválido. Informe um UUID." });
        return;
    }

    try {
        const product = await ProductRepository.findById(id);

        res.status(200).json(product);
    } catch (error) {
        sendDatabaseError(res, error, {
            default: "Erro ao buscar produto.",
            notFound: "Produto não encontrado.",
        });
    }
}

async function create(req: Request, res: Response) {
    const { data, errors } = validateProduct(req.body, false);

    if (errors.length > 0) {
        res.status(400).json({ message: "Dados inválidos.", errors });
        return;
    }

    try {
        const product = await ProductRepository.create(data as ProductInput);

        res.status(201).json(product);
    } catch (error) {
        sendDatabaseError(res, error, {
            default: "Erro ao criar produto.",
            foreignKey: "A categoria informada em 'category_id' não existe.",
        });
    }
}

async function update(req: Request<{ id: string }>, res: Response) {
    const { id } = req.params;

    if (!isUUID(id)) {
        res.status(400).json({ message: "ID do produto inválido. Informe um UUID." });
        return;
    }

    const { data, errors } = validateProduct(req.body, true);

    if (errors.length > 0) {
        res.status(400).json({ message: "Dados inválidos.", errors });
        return;
    }

    try {
        const product = await ProductRepository.update(id, data);

        res.status(200).json(product);
    } catch (error) {
        sendDatabaseError(res, error, {
            default: "Erro ao atualizar produto.",
            notFound: "Produto não encontrado.",
            foreignKey: "A categoria informada em 'category_id' não existe.",
        });
    }
}

async function remove(req: Request<{ id: string }>, res: Response) {
    const { id } = req.params;

    if (!isUUID(id)) {
        res.status(400).json({ message: "ID do produto inválido. Informe um UUID." });
        return;
    }

    try {
        await ProductRepository.remove(id);

        res.status(200).json({ message: "Produto removido com sucesso." });
    } catch (error) {
        sendDatabaseError(res, error, {
            default: "Erro ao excluir produto.",
            notFound: "Produto não encontrado.",
        });
    }
}

export default {
    getAll,
    getById,
    create,
    update,
    remove
};
