import { Router } from "express";
import getRoutes from "./routes/get/index.js";
import updateRoutes from "./routes/update/index.js";

const router = Router();
router.use("/", getRoutes);
router.use("/", updateRoutes);

export default router;
