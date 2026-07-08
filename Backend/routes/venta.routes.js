const express = require('express');
const router = express.Router();
const { storeVenta, getVentas, getVentaByFactura, deleteVenta, updateVenta, getUltimasVentas } = require('../controllers/venta.controllers');
const authGuard = require('../middlewares/jwt.guard');

router.get('/', getVentas);
router.get('/factura/:factura', authGuard, getVentaByFactura);
router.get('/ultimasventas', authGuard, getUltimasVentas);

router.post('/store', authGuard, storeVenta);
router.delete('/all-products/:factura', authGuard, deleteVenta);
router.put('/:id', authGuard, updateVenta);


module.exports = router;
