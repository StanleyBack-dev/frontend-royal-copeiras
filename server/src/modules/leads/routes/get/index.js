import { Router } from "express";
import { getLeadsController } from "../../controllers/get/index.js";

const router = Router();
router.get("/", getLeadsController());

export default router;
