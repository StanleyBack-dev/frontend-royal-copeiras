import { Router } from "express";
import { generateContractPreviewController } from "../../controllers/pdf/preview.js";
import { sendContractEmailController } from "../../controllers/pdf/send-email.js";
import { sendContractSignatureRequestController } from "../../controllers/pdf/send-signature-request.js";
import { closeContractWithoutSignatureController } from "../../controllers/pdf/close-without-signature.js";

const router = Router();
router.post("/pdf/preview", generateContractPreviewController());
router.post("/:id/pdf/send-email", sendContractEmailController());
router.post("/:id/signature-request", sendContractSignatureRequestController());
router.post(
  "/:id/close-without-signature",
  closeContractWithoutSignatureController(),
);

export default router;
