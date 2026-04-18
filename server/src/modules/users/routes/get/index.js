import { Router } from "express";
import { getUsersController } from "../../controllers/get/index.js";
import { getMyPagePermissionsController } from "../../controllers/get/my-permissions.js";
import { getUserPagePermissionsController } from "../../controllers/get/permissions.js";

const router = Router();

router.get("/", getUsersController());
router.get("/me/page-permissions", getMyPagePermissionsController());
router.get("/:id/page-permissions", getUserPagePermissionsController());

export default router;
