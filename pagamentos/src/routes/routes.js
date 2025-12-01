const { Router } = require('express');
const {
  createTypePayment,
  getAllTypePayments,
  createPayment,
  processPayment,
  getPaymentsByOrderId
} = require('../controllers/payment_controller.js');
const { cacheMiddleware } = require('../middlewares/cache');

const router = Router();

router.get('/type-payments', cacheMiddleware(null), getAllTypePayments);
router.post('/type-payments', createTypePayment);

router.post('/payments', createPayment);
router.patch('/payments/:id/process', processPayment);
router.get('/payments/order/:orderId', getPaymentsByOrderId);

module.exports = router;