const express = require('express');
const router = express.Router();

const userRoutes = require('./user.routes');
const articuloRoutes = require('./articulo.routes');
const clienteRoutes = require('./cliente.routes');
const ventaRoutes = require('./venta.routes');
const cajaRoutes = require('./caja.routes');
const reportesRoutes = require('./reporte.routes');

// Rutas principales
router.use('/reportes', reportesRoutes);

router.use('/users', userRoutes);
router.use('/articulos', articuloRoutes);
router.use('/clientes', clienteRoutes);
router.use('/ventas', ventaRoutes);
router.use('/caja', cajaRoutes);

module.exports = router;
