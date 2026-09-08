import { Router } from "express";
import { submitPublicIntakeController } from "../../controllers/submit/index.js";

const router = Router();
router.post("/submit", submitPublicIntakeController());

export default router;
