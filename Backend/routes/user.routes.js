const express = require('express');
const router = express.Router();
const userControllers = require('../controllers/user.controllers');



router.get('/', userControllers.getAllUsers);
router.get('/:id', userControllers.getUserById);

router.post('/', userControllers.createUser);
router.post('/login',  userControllers.login);

router.put('/:id', userControllers.updateUser);
router.delete('/:id', userControllers.deleteUser);

module.exports = router;
