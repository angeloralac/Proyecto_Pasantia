const { Router } = require('express');
const { 
  getCajaAbierta, 
  abrirCaja, 
  cerrarCaja, 
  getHistorialCajas 
} = require('../controllers/caja.controllers');

const router = Router();

// 1. Verificar si hay una caja abierta actualmente
router.get('/activa', getCajaAbierta);

// 2. Abrir una nueva caja
router.post('/abrir', abrirCaja);

// 3. Cerrar la caja (Hacer el corte). Recibe el ID de la caja a cerrar.
router.put('/cerrar/:id', cerrarCaja);

// 4. Ver el historial de todos los cortes de caja anteriores
router.get('/historial', getHistorialCajas);

module.exports = router;