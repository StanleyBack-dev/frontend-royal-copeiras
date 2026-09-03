import { Router } from "express";
import { updateCompanyProfileController } from "../../controllers/update/index.js";

const router = Router();

router.put("/", updateCompanyProfileController());
router.patch("/", updateCompanyProfileController());

export default router;
