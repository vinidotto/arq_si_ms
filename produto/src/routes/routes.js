const { Router } = require('express');
const {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  updateStock,
} = require('../controllers/produto_controller.js');
const { cacheMiddleware } = require('../middlewares/cache');

const router = Router();

router.get('/products', cacheMiddleware(14400), getAllProducts);
router.get('/products/:id', cacheMiddleware(14400), getProductById);

router.post('/products', createProduct);
router.patch('/products/:id', updateProduct);
router.delete('/products/:id', deleteProduct);
router.patch('/products/:id/stock', updateStock);

module.exports = router;