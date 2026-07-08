const express = require('express');
const router = express.Router();
const clienteControllers = require('../controllers/cliente.controllers');
const authGuard = require('../middlewares/jwt.guard');


router.get('/', clienteControllers.getAllClientes);
router.get('/:id', clienteControllers.getClienteById);


router.post('/', authGuard, clienteControllers.createCliente);
router.put('/:id', authGuard, clienteControllers.updateCliente);
router.delete('/:id', authGuard, clienteControllers.deleteCliente);

module.exports = router;
