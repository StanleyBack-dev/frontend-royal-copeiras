import { Router } from "express";
import { updateEventAssignmentController } from "../../controllers/update/index.js";

const router = Router();
router.patch("/assignments/:id", updateEventAssignmentController());

export default router;
