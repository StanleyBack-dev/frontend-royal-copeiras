import { Router } from "express";
import { createContractsController } from "../../controllers/create/index.js";

const router = Router();
router.post("/", createContractsController());

export default router;
