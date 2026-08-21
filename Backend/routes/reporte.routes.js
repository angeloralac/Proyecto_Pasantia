const express = require('express');
const router = express.Router();
const reportesController = require('../controllers/reporte.controllers');
const authGuard = require('../middlewares/jwt.guard');

// Protegemos la ruta para que solo usuarios logueados puedan descargar reportes
router.use(authGuard);

// Ruta final: GET /reportes/ventas/pdf
router.get('/ventas/pdf', reportesController.descargarReporteVentasPDF);

module.exports = router;