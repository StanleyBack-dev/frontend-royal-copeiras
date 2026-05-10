import { Router } from "express";
import { getPaymentsController } from "../../controllers/get/index.js";

const router = Router();
router.get("/", getPaymentsController());

export default router;
