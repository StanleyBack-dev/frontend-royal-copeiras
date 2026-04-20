import { Router } from "express";
import { generateContractPreviewController } from "../../controllers/pdf/preview.js";
import { sendContractEmailController } from "../../controllers/pdf/send-email.js";

const router = Router();
router.post("/pdf/preview", generateContractPreviewController());
router.post("/:id/pdf/send-email", sendContractEmailController());

export default router;
