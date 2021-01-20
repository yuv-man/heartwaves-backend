const express = require('express');
const { signUpUser, signIn, isAuthenticated, getAuthenticatedUser, logOut, updateUserSettings, getAllUsers, isAdmin } = require('../controller/userController');
const router = express.Router();
const helpers = require('../utlis/helpers');

router.post('/sign-up', helpers.validateSignUpForm, signUpUser);
router.post('/sign-in', signIn);
router.post('/auth', isAuthenticated, getAuthenticatedUser);
router.post('/log-out', logOut);
router.post('/update-settings', isAuthenticated, helpers.validateUserSettings, updateUserSettings);
router.post('/', isAuthenticated, isAdmin, getAllUsers);

module.exports = router;