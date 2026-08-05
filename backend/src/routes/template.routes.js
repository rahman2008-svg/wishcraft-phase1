import { Router } from 'express';
import * as templateController from '../controllers/template.controller.js';

const router = Router();

router.get('/', templateController.listTemplates);
router.get('/:slug', templateController.getTemplate);

export default router;
