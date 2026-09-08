import { Router } from "express";
import getRoutes from "./routes/get/index.js";
import generateRoutes from "./routes/generate/index.js";
import verifyRoutes from "./routes/verify/index.js";
import submitRoutes from "./routes/submit/index.js";

const router = Router();
router.use("/", getRoutes);
router.use("/", generateRoutes);
router.use("/", verifyRoutes);
router.use("/", submitRoutes);

export default router;
