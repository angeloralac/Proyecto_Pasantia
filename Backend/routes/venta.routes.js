const express = require('express');
const router = express.Router();
const { storeVenta, getVentas, getVentaByFactura, deleteVenta, updateVenta, getUltimasVentas, getVentaByCreationDate, getDashboardMetrics, getTopArticulos } = require('../controllers/venta.controllers');
const authGuard = require('../middlewares/jwt.guard');


router.get('/metricas/dashboard', getDashboardMetrics);
router.get('/top-articulos', getTopArticulos);
router.get('/', getVentas);
router.get('/factura/:factura', getVentaByFactura);
router.get('/ultimasventas', getUltimasVentas);
router.get('/fecha/:fecha' , getVentaByCreationDate);


router.post('/store', storeVenta);
router.delete('/all-products/:factura', deleteVenta);
router.put('/:id', updateVenta);


module.exports = router;
