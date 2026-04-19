import { Router } from "express";
import getRoutes from "./routes/get/index.js";
import createRoutes from "./routes/create/index.js";
import pdfRoutes from "./routes/pdf/index.js";
import updateRoutes from "./routes/update/index.js";

const router = Router();
router.use("/", getRoutes);
router.use("/", createRoutes);
router.use("/", pdfRoutes);
router.use("/", updateRoutes);

export default router;
