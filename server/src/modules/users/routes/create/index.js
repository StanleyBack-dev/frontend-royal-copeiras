import { Router } from "express";
import { createUsersController } from "../../controllers/create/index.js";

const router = Router();

router.post("/", createUsersController());

export default router;
