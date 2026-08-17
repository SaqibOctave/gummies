import { Router } from 'express';
import { authenticateAdmin, requireMinRole } from '../../common/middleware';
import { validate } from '../../common/validation';
import { homepageController } from './homepage.controller';
import {
  createHomepageBlockSchema,
  updateHomepageBlockSchema,
  homepageBlockIdParamSchema,
} from './homepage.validation';

const router = Router();

router.get('/public', homepageController.getPublic);

router.use(authenticateAdmin, requireMinRole('admin'));
router.get('/', homepageController.list);
router.get('/:id', validate(homepageBlockIdParamSchema, 'params'), homepageController.getById);
router.post('/', validate(createHomepageBlockSchema), homepageController.create);
router.patch(
  '/:id',
  validate(homepageBlockIdParamSchema, 'params'),
  validate(updateHomepageBlockSchema),
  homepageController.update
);
router.delete('/:id', validate(homepageBlockIdParamSchema, 'params'), homepageController.remove);

export default router;
