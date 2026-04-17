import { Router } from "express";
import {
  changeMyPasswordController,
  loginController,
  logoutController,
  refreshAuthSessionController,
} from "./controllers/index.js";

const router = Router();

router.post("/login", loginController());
router.post("/refresh", refreshAuthSessionController());
router.post("/logout", logoutController());
router.post("/change-password", changeMyPasswordController());

export default router;
