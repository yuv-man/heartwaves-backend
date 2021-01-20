const { body, validationResult } = require('express-validator');
const userController = require('../controller/userController');
const User = require('../model/User');


module.exports.validateSignUpForm = [
    body('fullName').trim().escape().notEmpty().isLength({ max: 254 }).withMessage(`Can't be empty or exceed 254 chars`),
    body('phone').trim().escape().isMobilePhone('he-IL').withMessage('Must be an Israeli phone number'),
    body('email').trim().escape().isEmail().isLength({ max: 254 }).custom(async(value, { req }) => {

        const user = await User.findUserByEmail(value);
        if (user) {
            throw new Error('Email is already used');
        }
        return true
    }),
    body('password').trim().isLength({ min: 6, max: 12 }).withMessage('Password must be between 6-12'),
    body('confirmPassword').trim().custom((value, { req }) => {
        if (value !== req.body.password) {
            throw new Error('Passwords do not match');
        }
        return true;
    }),
    (req, res, next) => {
        // Finds the validation errors in this request and wraps them in an object with handy functions
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() }).send("there was an error");
        }
        // Call next middleware if form is valid
        next();
    }
]

module.exports.validateUserSettings = [
    body('fullName').optional(true).trim().escape().notEmpty().isLength({ max: 254 }).withMessage(`Can't be empty or exceed 254 chars`),
    body('phone').optional(true).trim().escape().isMobilePhone('he-IL').withMessage('Must be an Israeli phone number'),
    body('email').optional(true).escape().isEmail().withMessage('Invalid email').isLength({ max: 254 }).custom(async(value, { req }) => {
        const currentUser = await userController.returnUserFromToken(req);
        if (currentUser.email !== value) {
            const user = await User.findUserByEmail(value);
            if (user) {
                throw new Error('Email is already used');
            }
        }
        return true
    }),
    body('password').optional(true).trim().isLength({ min: 6, max: 12 }).withMessage('New password must be between 6-12').custom(async(value, { req }) => {
        const currentUser = await userController.returnUserFromToken(req);
        if (!req.body.currentPassword || !User.passwordMatch(req.body.currentPassword, currentUser)) {
            throw new Error('Your current password is incorrect');
        }
        return true
    }),
    (req, res, next) => {
        // Finds the validation errors in this request and wraps them in an object with handy functions
        //console.log(req);
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        // Call next middleware if form is valid
        next();
    }
]