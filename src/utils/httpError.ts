import type { Response } from "express";

type DatabaseError = {
    code?: string;
};

type ErrorMessages = {
    default: string;
    notFound?: string;
    foreignKey?: string;
    foreignKeyStatus?: number;
};

// Converte erros do Supabase/PostgreSQL em respostas HTTP adequadas.
export function sendDatabaseError(res: Response, error: unknown, messages: ErrorMessages) {
    const code = (error as DatabaseError | null)?.code;

    // PGRST116: nenhum registro encontrado ao usar .single()
    if (code === "PGRST116" && messages.notFound) {
        res.status(404).json({ message: messages.notFound });
        return;
    }

    // 23503: violação de chave estrangeira
    if (code === "23503" && messages.foreignKey) {
        res.status(messages.foreignKeyStatus ?? 400).json({ message: messages.foreignKey });
        return;
    }

    // 22P02: formato de dado inválido | 23502: campo obrigatório nulo | 23514: violação de CHECK
    if (code === "22P02" || code === "23502" || code === "23514") {
        res.status(400).json({ message: "Dados inválidos para o banco de dados." });
        return;
    }

    // 23505: registro duplicado
    if (code === "23505") {
        res.status(409).json({ message: "Registro duplicado." });
        return;
    }

    console.error(`${messages.default}`, error);

    res.status(500).json({ message: messages.default });
}
