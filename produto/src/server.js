require('dotenv').config();
const express = require("express");
const produtoRoutes = require("./routes/routes.js");
const { limiter, payloadLimiter } = require("./middleware/rateLimiter");
const { cacheMiddleware } = require("./middleware/redisCache");

const app = express();
const PORT = process.env.PORT || 3002; 

app.set('trust proxy', 1);
app.use(payloadLimiter);
app.use(express.json());
app.use(limiter);

// Cache para GET /api/products com TTL de 4 horas (14400 segundos)
app.get("/api/products", cacheMiddleware(14400));

app.use("/api", produtoRoutes);

app.listen(PORT, () => {
  console.log(`🚀 Servidor de Produtos rodando na porta ${PORT}`);
});
