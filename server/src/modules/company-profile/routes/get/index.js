import { Router } from "express";
import { getCompanyProfileController } from "../../controllers/get/index.js";

const router = Router();

router.get("/", getCompanyProfileController());

export default router;
