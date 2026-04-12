import { Router } from "express";
import { createCustomersController } from "../../controllers/create/index.js";

const router = Router();

router.post("/", createCustomersController());

export default router;
