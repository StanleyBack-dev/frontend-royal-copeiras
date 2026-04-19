import { Router } from "express";
import { getBudgetsController } from "../../controllers/get/index.js";

const router = Router();
router.get("/", getBudgetsController());

export default router;
