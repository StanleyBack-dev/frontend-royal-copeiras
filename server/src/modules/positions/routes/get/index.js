import { Router } from "express";
import { getPositionsController } from "../../controllers/get/index.js";

const router = Router();

router.get("/", getPositionsController());

export default router;
