const express = require('express');
const router = express.Router();
const clienteControllers = require('../controllers/cliente.controllers');
const authGuard = require('../middlewares/jwt.guard');

// Aplicamos el authGuard para proteger TODAS las rutas de clientes
router.use(authGuard);

// Rutas protegidas de lectura
router.get('/', clienteControllers.getAllClientes);
router.get('/:id', clienteControllers.getClienteById);

// Rutas protegidas de escritura y modificación
router.post('/', clienteControllers.createCliente);
router.put('/:id', clienteControllers.updateCliente);
router.delete('/:id', clienteControllers.deleteCliente);

module.exports = router;