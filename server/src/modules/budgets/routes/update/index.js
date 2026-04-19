import { Router } from "express";
import { updateBudgetsController } from "../../controllers/update/index.js";

const router = Router();
router.put("/:id", updateBudgetsController());

export default router;
