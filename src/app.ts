import express from "express";
import type { NextFunction, Request, Response } from "express";
import categoryRoutes from "./routes/categoryRoutes.js";
import productRoutes from "./routes/productRoutes.js";

const app = express();

app.use(express.json());

// =====================
// Root
// =====================
app.get("/", (req, res) => {
    res.status(200).json({
        message: "Clothing Store System - API",
        version: "1.0.0",
    });
});

// =====================
// Categories
// =====================
app.use("/categories", categoryRoutes);

// =====================
// Products
// =====================
app.use("/products", productRoutes);

// =====================
// Rota não encontrada
// =====================
app.use((req, res) => {
    res.status(404).json({
        message: "Rota não encontrada.",
    });
});

// =====================
// Tratamento de erros gerais (ex.: JSON mal formatado)
// =====================
app.use((error: unknown, req: Request, res: Response, next: NextFunction) => {
    if (error instanceof SyntaxError && "body" in error) {
        res.status(400).json({ message: "JSON inválido no corpo da requisição." });
        return;
    }

    console.error("Erro inesperado:", error);

    res.status(500).json({ message: "Erro interno do servidor." });
});

export default app;
