const express = require('express');
const router = express.Router();
const { googleLogin, authCallback } = require('../../controllers/userlogin/authController');


router.get('/google', googleLogin);
router.post('/callback', authCallback);

module.exports = router;