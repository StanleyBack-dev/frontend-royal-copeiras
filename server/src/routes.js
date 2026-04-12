import { Router } from 'express';
import customersRoutes from './modules/customers/routes.js';

const router = Router();

router.use('/customers', customersRoutes);

export default router;
