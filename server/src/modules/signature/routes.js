import { Router } from "express";
import { createSignatureRequestController } from "./controllers/create-signature-request.controller.js";
import { getSignatureStatusController } from "./controllers/get-signature-status.controller.js";
import { cancelSignatureRequestController } from "./controllers/cancel-signature-request.controller.js";
import { getSignaturesController } from "./controllers/get-signatures.controller.js";

const router = Router();

router.post("/", createSignatureRequestController());
router.get("/", getSignaturesController());
router.get("/:requestId/status", getSignatureStatusController());
router.post("/:requestId/cancel", cancelSignatureRequestController());

export default router;
