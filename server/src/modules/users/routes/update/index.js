import { Router } from "express";
import { updateUsersController } from "../../controllers/update/index.js";
import { unlockUserCredentialController } from "../../controllers/update/unlock.js";

const router = Router();

router.put("/:id", updateUsersController());
router.post("/:id/unlock", unlockUserCredentialController());

export default router;
