const express = require('express');
const fileUpload = require('express-fileupload');
const userCtrl = require('../controller/userController');
const patientCtrl = require('../controller/patientController');
const router = express.Router();

router.post('/upload-heart-graph', fileUpload({ createParentPath: true }), userCtrl.isAuthenticated, patientCtrl.analyzePatientData);
router.post('/my-records', userCtrl.isAuthenticated, patientCtrl.getPatientRecords);

module.exports = router;