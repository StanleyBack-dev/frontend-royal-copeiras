import { Router } from "express";
import { updateSuppliesController } from "../../controllers/update/index.js";

const router = Router();

router.put("/:id", updateSuppliesController());

export default router;
