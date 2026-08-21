const express = require('express');
const router = express.Router();
const userControllers = require('../controllers/user.controllers');
const authGuard = require('../middlewares/jwt.guard');



router.post('/login', userControllers.login);
router.post('/', userControllers.createUser); // Ruta para crear un usuario (registro)

// Ruta para renovar el token de acceso usando el refresh token
router.post('/refresh-token', userControllers.renovarToken);

// RUTAS PROTEGIDAS (Exigen un token 100% válido)
router.use(authGuard);
router.get('/',  userControllers.getAllUsers);
router.get('/:id',  userControllers.getUserById);
router.put('/:id', userControllers.updateUser);
router.delete('/:id', userControllers.deleteUser);

module.exports = router;