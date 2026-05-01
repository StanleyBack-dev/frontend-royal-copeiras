import { Router } from "express";
import { getEventsController } from "../../controllers/get/index.js";

const router = Router();
router.get("/", getEventsController());

export default router;
