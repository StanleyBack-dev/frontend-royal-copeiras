import { Router } from "express";
import { getEmployeesController } from "../../controllers/get/index.js";

const router = Router();

router.get("/", getEmployeesController());

export default router;
