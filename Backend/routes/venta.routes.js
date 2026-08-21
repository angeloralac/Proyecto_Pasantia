const express = require('express');
const router = express.Router();
const { 
  storeVenta, 
  getVentas, 
  getVentaByFactura, 
  deleteVenta, 
  updateVenta, 
  getUltimasVentas, 
  getVentaByCreationDate, 
  getDashboardMetrics, 
  getTopArticulos, 
  getDetallesVenta 
} = require('../controllers/venta.controllers');
const authGuard = require('../middlewares/jwt.guard');
const { requerirCajaAbierta, requerirCajaCerrada } = require('../middlewares/caja.middleware');

router.use(authGuard); // Protege todas las rutas de ventas con JWT
router.get('/', getVentas);
router.get('/ultimasventas', getUltimasVentas);
router.get('/metricas/dashboard', getDashboardMetrics);
router.get('/top-articulos', getTopArticulos);
router.get('/factura/:factura', getVentaByFactura);
router.get('/detalles/:factura', getDetallesVenta);
router.get('/fecha/:fecha', getVentaByCreationDate);


router.post('/store', requerirCajaAbierta, storeVenta);
router.put('/:id', updateVenta);
router.delete('/all-products/:factura', deleteVenta);

module.exports = router;