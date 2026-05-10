import { Router } from "express";
import { updatePaymentsController } from "../../controllers/update/index.js";

const router = Router();
router.patch("/:id", updatePaymentsController());

export default router;
