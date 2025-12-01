const { Router } = require('express');
const {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
} = require('../controllers/order_controller.js');
const { cacheMiddleware } = require('../middlewares/cache');

const router = Router();

// Com cache (TTL: 30 dias)
router.get('/orders', cacheMiddleware(2592000), getOrders);
router.get('/orders/:id', cacheMiddleware(2592000), getOrderById);

router.post('/orders', createOrder);
router.patch('/orders/:id/status', updateOrderStatus);

module.exports = router;