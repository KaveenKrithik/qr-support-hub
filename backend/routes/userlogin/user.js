const express = require('express');
const router = express.Router();
const  auth  = require('../../middleware/auth');
const  role  = require('../../middleware/role');
const { createRequest, getRequests, getGradeSheet } = require('../../controllers/userlogin/userController');

router.post('/requests', auth, role('user'), createRequest);
router.get('/requests', auth, role('user'), getRequests);
router.get('/grade-sheet', auth, role('user'), getGradeSheet);

module.exports = router;