import { Router } from "express";
import { updateUsersController } from "../../controllers/update/index.js";

const router = Router();

router.put("/:id", updateUsersController());

export default router;
