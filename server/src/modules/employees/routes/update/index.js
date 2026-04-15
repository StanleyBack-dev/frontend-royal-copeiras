import { Router } from "express";
import { updateEmployeesController } from "../../controllers/update/index.js";

const router = Router();

router.put("/:id", updateEmployeesController());

export default router;
