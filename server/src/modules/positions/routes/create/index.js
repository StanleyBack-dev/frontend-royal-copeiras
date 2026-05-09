import { Router } from "express";
import { createPositionsController } from "../../controllers/create/index.js";

const router = Router();

router.post("/", createPositionsController());

export default router;
