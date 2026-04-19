import { Router } from "express";
import authRoutes from "./modules/auth/routes.js";
import budgetsRoutes from "./modules/budgets/routes.js";
import customersRoutes from "./modules/customers/routes.js";
import employeesRoutes from "./modules/employees/routes.js";
import leadsRoutes from "./modules/leads/routes.js";
import usersRoutes from "./modules/users/routes.js";
import observabilityRoutes from "./modules/observability/routes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/budgets", budgetsRoutes);
router.use("/customers", customersRoutes);
router.use("/employees", employeesRoutes);
router.use("/leads", leadsRoutes);
router.use("/users", usersRoutes);
router.use("/observability", observabilityRoutes);

export default router;
