import { Router } from 'express';
import authRoutes from '../modules/auth/auth.routes';
import adminsRoutes from '../modules/admins/admins.routes';
import categoriesRoutes from '../modules/categories/categories.routes';
import productsRoutes from '../modules/products/products.routes';
import inventoryRoutes from '../modules/inventory/inventory.routes';
import customersRoutes from '../modules/customers/customers.routes';
import ordersRoutes from '../modules/orders/orders.routes';
import homepageRoutes from '../modules/homepage/homepage.routes';
import mediaRoutes from '../modules/media/media.routes';
import reportsRoutes from '../modules/reports/reports.routes';
import settingsRoutes from '../modules/settings/settings.routes';
import auditRoutes from '../modules/audit/audit.routes';

const router = Router();

router.get('/health', (_req, res) => {
  res.json({ success: true, data: { status: 'ok', timestamp: new Date().toISOString() } });
});

router.use('/auth', authRoutes);
router.use('/admins', adminsRoutes);
router.use('/categories', categoriesRoutes);
router.use('/products', productsRoutes);
router.use('/inventory', inventoryRoutes);
router.use('/customers', customersRoutes);
router.use('/orders', ordersRoutes);
router.use('/homepage', homepageRoutes);
router.use('/media', mediaRoutes);
router.use('/reports', reportsRoutes);
router.use('/settings', settingsRoutes);
router.use('/audit-logs', auditRoutes);

export default router;
