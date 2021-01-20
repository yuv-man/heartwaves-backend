const User = require('../model/User');
const jwt = require('jsonwebtoken');

let secureCookie = false;
if (parseInt(process.env.COOKIE_SECURE)) {
    secureCookie = true;
}

const tokenMaxAge = 3 * 24 * 60 * 60; // 3 days
const cookieMaxAge = tokenMaxAge * 1000;
const authCookieOptions = { maxAge: cookieMaxAge, httpOnly: true, sameSite: process.env.COOKIE_SAMESITE, secure: secureCookie };
const authRemoveCookieOptions = { maxAge: 1, httpOnly: true, sameSite: process.env.COOKIE_SAMESITE, secure: secureCookie };



module.exports.getUserById = async(req, res) => {
    try {
        const user = await User.findUserById(req.params.uid);
        res.json(user);
    } catch (error) {
        console.error(error);
        res.send('User does not exist');
    }
}
module.exports.getUserByEmail = async(req, res) => {
    try {
        const user = await User.findUserByEmail(req.params.email);
        res.json(user);
    } catch (error) {
        console.error(error);
        res.json(null);
    }
}

module.exports.signUpUser = async(req, res) => {
    const newUser = await User.addNewUser(req.body);
    const token = createToken(newUser._id);
    res.cookie('auth', token, authCookieOptions);
    res.json(newUser);
}

module.exports.signIn = async(req, res) => {
    const user = await User.login(req.body.email, req.body.password);

    if (user) {
        const token = createToken(user._id);
        console.log(token);
        res.cookie('auth', token, authCookieOptions);
        return res.json(user);
    }
    res.status(401).send("Email or password is incorrect");
}

module.exports.logOut = (req, res) => {
    res.cookie('auth', '', authRemoveCookieOptions);
    res.send('logged-out');
}

module.exports.isAuthenticated = async(req, res, next) => {
    const user = await returnUserFromToken(req);
    if (user) {
        req.currentUser = user;
        return next();
    }
    res.status(401).send('Not authenticated');
}
module.exports.getAuthenticatedUser = async(req, res) => {
    res.json(req.currentUser);
}
module.exports.getAllUsers = async(req, res) => {
    const data = await User.getAllUsers(req.body.limit, req.body.pageNum);
    res.json(data);

}

module.exports.updateUserSettings = async(req, res) => {

    const updatedUserData = {};
    Object.entries(req.body).forEach(pair => {
        if (pair[0] !== 'currentPassword') {
            updatedUserData[pair[0]] = pair[1]
        }
    })
    const user = await User.update(req.currentUser._id, updatedUserData);
    res.json(user);
}

module.exports.isAdmin = (req, res, next) => {
    if (req.currentUser && req.currentUser.type === 'ADMIN') {
        return next()
    }
    return res.status(403).send("Not allowed");
}

async function returnUserFromToken(req) {
    const token = verifyToken(req);
    if (token) {
        return user = await User.findUserById(token.uid);
    } else {
        return null
    }
}

function verifyToken(req) {
    const token = req.cookies.auth; //req.headers.auth;
    let dToken = null;
    if (token) {
        jwt.verify(token, process.env.TOKEN_SECRET, (err, decodedToken) => {
            if (!err) {
                dToken = decodedToken;
            }
        })
    }
    return dToken;
}

function createToken(uid) {
    return jwt.sign({ uid }, process.env.TOKEN_SECRET, { expiresIn: tokenMaxAge })
}