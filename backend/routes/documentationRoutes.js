const express = require('express');
const router = express.Router();
const documentationController = require('../controllers/documentationController');

// Fetch repository contents
router.post('/fetch-repo', documentationController.fetchRepository);

// Generate documentation
router.post('/generate', documentationController.generateDocumentation);

// Fetch file content
router.post('/fetch-file', documentationController.fetchFileContent);

module.exports = router;