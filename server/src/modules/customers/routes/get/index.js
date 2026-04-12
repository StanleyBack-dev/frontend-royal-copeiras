import { Router } from 'express';
import { getCustomersController } from '../../controllers/get/index.js';

const router = Router();

router.get('/', getCustomersController());

export default router;
