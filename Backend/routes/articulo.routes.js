const express = require('express');
const router = express.Router();
const  articuloControllers = require('../controllers/articulo.controllers');
const { validarStock } = require('../middlewares/articulo.middleware')
const  authGuard  = require('../middlewares/jwt.guard');


router.get('/', articuloControllers.getAllArticulos);
router.get('/findID/:codigo', articuloControllers.getArticuloById);
router.get('/search', articuloControllers.searchArticulos);

// Usar validarStock para crear artículos
router.post('/', authGuard, articuloControllers.createArticulo);
router.post('/store', authGuard, articuloControllers.createArticulo);
router.post('/search', articuloControllers.searchArticulos);
router.put('/:codigo', authGuard, articuloControllers.updateArticulo);
router.delete('/:codigo', authGuard, articuloControllers.deleteArticulo);


module.exports = router;
