//define las rutas

const express = require('express');
const router = express.Router();
const controller = require('../controllers/ordenesController');

// Ruta GET para filtros
router.get('/', controller.handleGet);
router.post('/', controller.crearOrden); // Ruta POST para crear orden (transacción)

module.exports = router;