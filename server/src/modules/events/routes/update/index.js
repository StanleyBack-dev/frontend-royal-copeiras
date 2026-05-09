import { Router } from "express";
import {
  updateEventAssignmentController,
  updateEventController,
} from "../../controllers/update/index.js";

const router = Router();
router.patch("/assignments/:id", updateEventAssignmentController());
router.patch("/:id", updateEventController());

export default router;
