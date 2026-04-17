import { Router } from "express";
import { getMetricsSnapshot } from "../../shared/observability/metrics-store.js";

const router = Router();

router.get("/metrics", (_req, res) => {
  res.json({
    success: true,
    data: getMetricsSnapshot(),
  });
});

export default router;
