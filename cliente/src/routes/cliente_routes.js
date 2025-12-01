const { Router } = require("express");
const { ClienteController } = require("../controllers/cliente_controller");
const { cacheMiddleware } = require("../middlewares/cache");

const router = Router();

// cache (TTL: 1 dia)
router.get("/users", cacheMiddleware(86400), ClienteController.getAll);
router.get("/users/:id", cacheMiddleware(86400), ClienteController.getById);

router.post("/users", ClienteController.create);
router.patch("/users/:id", ClienteController.update);
router.delete("/users/:id", ClienteController.delete);

module.exports = router;