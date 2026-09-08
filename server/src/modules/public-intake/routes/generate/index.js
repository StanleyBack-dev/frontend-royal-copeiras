import { Router } from "express";
import { generatePublicIntakeCodeController } from "../../controllers/generate/index.js";

const router = Router();
router.post("/generate-code", generatePublicIntakeCodeController());

export default router;
