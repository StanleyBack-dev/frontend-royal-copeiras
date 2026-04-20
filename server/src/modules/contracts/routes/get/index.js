import { Router } from "express";
import { getContractsController } from "../../controllers/get/index.js";

const router = Router();
router.get("/", getContractsController());

export default router;
