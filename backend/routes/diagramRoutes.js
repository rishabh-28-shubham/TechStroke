const express = require('express');
const router = express.Router();
const diagramController = require('../controllers/diagramController');

// Generate diagram from documentation
router.post('/generate', diagramController.generateDiagram);

module.exports = router; 