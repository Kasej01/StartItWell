const express = require('express');
const {
  getEvents,
  addEvent,
  updateEvent,
  deleteEvent
} = require('../controllers/calendarEventController');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

router.use(authMiddleware);

router.get('/:widgetId', getEvents);
router.post('/', addEvent);
router.put('/:id', updateEvent);
router.delete('/:id', deleteEvent);

module.exports = router;