const { produtoService } = require("../services/produto_service.js");

// Criar produto
async function createProduct(req, res) {
  try {
    const product = await produtoService.create(req.body);
    return res.status(201).json(product);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
}

// Buscar todos os produtos
async function getAllProducts(req, res) {
  try {
    const products = await produtoService.getAll();
    return res.json(products);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

// Buscar produto por ID
async function getProductById(req, res) {
  try {
    const product = await produtoService.getById(Number(req.params.id));
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    return res.json(product);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

// Atualizar produto
async function updateProduct(req, res) {
  try {
    const product = await produtoService.update(
      Number(req.params.id),
      req.body
    );
    return res.json(product);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
}

// Deletar produto (deleção virtual)
async function deleteProduct(req, res) {
  try {
    await produtoService.softDelete(Number(req.params.id));
    return res.status(204).send();
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
}

// Atualizar estoque
async function updateStock(req, res) {
  try {
    const { quantity } = req.body;
    const product = await produtoService.updateStock(
      Number(req.params.id),
      quantity
    );
    return res.json(product);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
}

module.exports = {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  updateStock,
};