import { Router } from "express";
import { getUsersController } from "../../controllers/get/index.js";

const router = Router();

router.get("/", getUsersController());

export default router;
