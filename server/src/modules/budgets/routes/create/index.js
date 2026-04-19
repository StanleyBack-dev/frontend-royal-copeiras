import { Router } from "express";
import { createBudgetsController } from "../../controllers/create/index.js";

const router = Router();
router.post("/", createBudgetsController());

export default router;
