import { Router } from "express";
import categoryController from "../controller/Categorycontroller.js";

const router = Router();

router.get("/", categoryController.getAll);

router.get("/search/:keyword", categoryController.searchbyKeyword);

router.get("/:id", categoryController.getById);

router.post("/", categoryController.create);

router.put("/:id", categoryController.update);

router.delete("/:id", categoryController.remove);

export default router;
