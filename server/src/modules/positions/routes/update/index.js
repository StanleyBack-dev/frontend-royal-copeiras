import { Router } from "express";
import { updatePositionsController } from "../../controllers/update/index.js";

const router = Router();

router.put("/:id", updatePositionsController());

export default router;
