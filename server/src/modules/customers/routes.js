import { Router } from 'express';
import getRoutes from './routes/get/index.js';
import createRoutes from './routes/create/index.js';

const router = Router();
router.use('/', getRoutes);
router.use('/', createRoutes);

export default router;
