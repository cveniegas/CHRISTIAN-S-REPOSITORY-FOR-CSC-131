const express = require('express');
const authController = require('../controllers/auth');
const router = express.Router();


router.post('/register', authController.register);

router.post('/login', authController.login);

router.post('/postComment', authController.postComment);

router.post('/loadComments', authController.loadComments)

router.post('getProfile', authController.getProfile)

router.get('/logout', authController.logout );

module.exports = router;