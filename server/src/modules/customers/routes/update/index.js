import { Router } from "express";
import { updateCustomersController } from "../../controllers/update/index.js";

const router = Router();

router.put("/:id", updateCustomersController());

export default router;
