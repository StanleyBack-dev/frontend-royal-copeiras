import { Router } from "express";
import { createPaymentsController } from "../../controllers/create/index.js";

const router = Router();
router.post("/", createPaymentsController());

export default router;
