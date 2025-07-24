const express = require('express');
const {
  addWidgetData,
  getWidgetData,
  updateWidgetData,
  deleteWidgetData
} = require('../controllers/widgetDataController');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

router.use(authMiddleware);

router.post('/', addWidgetData);
router.get('/:widgetId', getWidgetData);
router.put('/:id', updateWidgetData);
router.delete('/:id', deleteWidgetData);

module.exports = router;