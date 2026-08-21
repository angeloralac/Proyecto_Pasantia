const { Router } = require('express');
const { 
  getCajaAbierta, 
  abrirCaja, 
  cerrarCaja, 
  getHistorialCajas 
} = require('../controllers/caja.controllers');
const { requerirCajaAbierta, requerirCajaCerrada } = require('../middlewares/caja.middleware');
const authGuard = require('../middlewares/jwt.guard');

const router = Router();

// Aplicamos el authGuard para proteger TODAS las rutas de caja
router.use(authGuard);

// 1. Verificar si hay una caja abierta actualmente
router.get('/activa', requerirCajaAbierta, getCajaAbierta);

// 2. Abrir una nueva caja
router.post('/abrir', requerirCajaCerrada, abrirCaja);

// 3. Cerrar la caja (Hacer el corte). Recibe el ID de la caja a cerrar.
router.put('/cerrar/:id', cerrarCaja);

// 4. Ver el historial de todos los cortes de caja anteriores
router.get('/historial', getHistorialCajas);

module.exports = router;