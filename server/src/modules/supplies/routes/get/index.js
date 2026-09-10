import { Router } from "express";
import { getSuppliesController } from "../../controllers/get/index.js";

const router = Router();

router.get("/", getSuppliesController());

export default router;
