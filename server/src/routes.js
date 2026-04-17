import { Router } from "express";
import customersRoutes from "./modules/customers/routes.js";
import employeesRoutes from "./modules/employees/routes.js";
import usersRoutes from "./modules/users/routes.js";
import observabilityRoutes from "./modules/observability/routes.js";

const router = Router();

router.use("/customers", customersRoutes);
router.use("/employees", employeesRoutes);
router.use("/users", usersRoutes);
router.use("/observability", observabilityRoutes);

export default router;
