import { Router } from 'express';
import { authenticateAdmin, requireMinRole, uploadImage } from '../../common/middleware';
import { validate } from '../../common/validation';
import { mediaController } from './media.controller';
import { uploadMediaSchema, listMediaQuerySchema, mediaIdParamSchema } from './media.validation';

const router = Router();

router.use(authenticateAdmin);

router.get('/', validate(listMediaQuerySchema, 'query'), mediaController.list);
router.get('/:id', validate(mediaIdParamSchema, 'params'), mediaController.getById);
router.post(
  '/',
  requireMinRole('staff'),
  uploadImage.single('file'),
  validate(uploadMediaSchema, 'body'),
  mediaController.upload
);
router.delete(
  '/:id',
  requireMinRole('admin'),
  validate(mediaIdParamSchema, 'params'),
  mediaController.remove
);

export default router;
