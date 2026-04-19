import { Router } from "express";
import { updateLeadsController } from "../../controllers/update/index.js";

const router = Router();
router.put("/:id", updateLeadsController());

export default router;
