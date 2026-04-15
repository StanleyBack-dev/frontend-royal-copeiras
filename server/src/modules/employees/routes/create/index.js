import { Router } from "express";
import { createEmployeesController } from "../../controllers/create/index.js";

const router = Router();

router.post("/", createEmployeesController());

export default router;
