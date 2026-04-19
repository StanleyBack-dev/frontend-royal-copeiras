import { Router } from "express";
import { generateBudgetPreviewController } from "../../controllers/pdf/preview.js";
import { sendBudgetEmailController } from "../../controllers/pdf/send-email.js";

const router = Router();

router.post("/pdf/preview", generateBudgetPreviewController());
router.post("/:id/pdf/send-email", sendBudgetEmailController());

export default router;
