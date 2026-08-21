const express = require('express');
const router = express.Router();
const articuloControllers = require('../controllers/articulo.controllers');
const validarStock  = require('../middlewares/articulo.middleware');
const authGuard = require('../middlewares/jwt.guard');

// Aplicamos el authGuard para proteger TODAS las rutas de este archivo
router.use(authGuard);

// Rutas de lectura (GET)
router.get('/', articuloControllers.getAllArticulos);
router.get('/search', articuloControllers.searchArticulos);
router.get('/findID/:codigo', articuloControllers.getArticuloById);

// Rutas de escritura y modificación (POST, PUT, DELETE)
// Incluimos el middleware validarStock donde corresponde
router.post('/', validarStock, articuloControllers.createArticulo);
router.post('/store', validarStock, articuloControllers.createArticulo);

// Corregido: Debe ser PUT (o PATCH) para actualizar, no GET
router.put('/:codigo', articuloControllers.updateArticulo);
router.delete('/:codigo', articuloControllers.deleteArticulo);

module.exports = router;