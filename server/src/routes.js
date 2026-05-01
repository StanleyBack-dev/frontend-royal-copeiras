import { Router } from "express";
import authRoutes from "./modules/auth/routes.js";
import budgetsRoutes from "./modules/budgets/routes.js";
import contractsRoutes from "./modules/contracts/routes.js";
import customersRoutes from "./modules/customers/routes.js";
import employeesRoutes from "./modules/employees/routes.js";
import leadsRoutes from "./modules/leads/routes.js";
import usersRoutes from "./modules/users/routes.js";
import observabilityRoutes from "./modules/observability/routes.js";
import signatureRoutes from "./modules/signature/routes.js";
import eventsRoutes from "./modules/events/routes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/budgets", budgetsRoutes);
router.use("/contracts", contractsRoutes);
router.use("/customers", customersRoutes);
router.use("/employees", employeesRoutes);
router.use("/leads", leadsRoutes);
router.use("/users", usersRoutes);
router.use("/observability", observabilityRoutes);
router.use("/signature", signatureRoutes);
router.use("/events", eventsRoutes);

export default router;
