import { Router } from "express";
import { createSuppliesController } from "../../controllers/create/index.js";

const router = Router();

router.post("/", createSuppliesController());

export default router;
