import { Router } from "express";
import { verifyPublicIntakeCodeController } from "../../controllers/verify/index.js";

const router = Router();
router.post("/verify-code", verifyPublicIntakeCodeController());

export default router;
