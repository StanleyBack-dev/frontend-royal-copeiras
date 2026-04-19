import { Router } from "express";
import { createLeadsController } from "../../controllers/create/index.js";

const router = Router();
router.post("/", createLeadsController());

export default router;
