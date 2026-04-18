import { Router } from "express";
import {
  changeMyPasswordController,
  loginController,
  logoutController,
  requestPasswordRecoveryController,
  resetPasswordWithRecoveryController,
  refreshAuthSessionController,
  verifyPasswordRecoveryCodeController,
} from "./controllers/index.js";

const router = Router();

router.post("/login", loginController());
router.post("/refresh", refreshAuthSessionController());
router.post("/logout", logoutController());
router.post("/change-password", changeMyPasswordController());
router.post("/password-recovery/request", requestPasswordRecoveryController());
router.post(
  "/password-recovery/verify",
  verifyPasswordRecoveryCodeController(),
);
router.post("/password-recovery/reset", resetPasswordWithRecoveryController());

export default router;
