const express = require('express');
const { getUser, updateUser, updatePassword, deleteUser } = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

// Protect all routes with JWT middleware
router.use(authMiddleware);

router.get('/:id', getUser);
router.put('/:id', updateUser);
router.put('/:id/password', updatePassword);
router.delete('/:id', deleteUser);

module.exports = router;