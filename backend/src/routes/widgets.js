const express = require('express');
const { addWidget, editWidget, deleteWidget } = require('../controllers/widgetController');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

router.use(authMiddleware);

router.post('/', addWidget);
router.put('/:id', editWidget);
router.delete('/:id', deleteWidget);

module.exports = router;