const express = require('express');
const router = express.Router();
const  articuloControllers = require('../controllers/articulo.controllers');
const { validarStock } = require('../middlewares/articulo.middleware')
const  authGuard  = require('../middlewares/jwt.guard');


router.get('/', articuloControllers.getAllArticulos);
router.get('/findID/:codigo', articuloControllers.getArticuloById);
router.get('/search', articuloControllers.searchArticulos);

// Usar validarStock para crear artículos
router.post('/', articuloControllers.createArticulo);
router.post('/store', articuloControllers.createArticulo);
router.get('/search', articuloControllers.searchArticulos);
router.get('/:codigo', articuloControllers.updateArticulo);
router.delete('/:codigo', authGuard, articuloControllers.deleteArticulo);


module.exports = router;
