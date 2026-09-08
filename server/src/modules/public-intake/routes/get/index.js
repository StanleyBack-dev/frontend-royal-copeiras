import { Router } from "express";
import { getPublicIntakeCodesController } from "../../controllers/get/index.js";

const router = Router();
router.get("/", getPublicIntakeCodesController());

export default router;
