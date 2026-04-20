import { Router } from "express";
import { updateContractsController } from "../../controllers/update/index.js";

const router = Router();
router.patch("/:id", updateContractsController());

export default router;
