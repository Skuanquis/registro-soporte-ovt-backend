const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authenticateToken = require('../middlewares/authMiddlewares');

router.post('/users', userController.createUser);
router.get('/pasantes', userController.getPasantes);
router.get('/pasantes/:id', userController.getPasanteById);
router.put('/pasantes/:id', userController.updatePasante);
router.post('/login', userController.loginUser);
router.get('/info', authenticateToken, userController.getUserInfo);
router.put('/perfil/:id', authenticateToken, userController.updateUserProfile); // Ajuste en la URL
router.put('/password/:id', authenticateToken, userController.updateUserPassword); // Ajuste en la URL

module.exports = router;
