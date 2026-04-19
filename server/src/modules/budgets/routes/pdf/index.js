import { Router } from "express";
import { generateBudgetPreviewController } from "../../controllers/pdf/preview.js";
import { freezeBudgetPdfController } from "../../controllers/pdf/freeze.js";
import { downloadBudgetPdfController } from "../../controllers/pdf/download.js";

const router = Router();

router.post("/pdf/preview", generateBudgetPreviewController());
router.post("/:id/pdf/freeze", freezeBudgetPdfController());
router.get("/:id/pdf/download", downloadBudgetPdfController());

export default router;
