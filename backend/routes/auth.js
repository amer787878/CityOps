const router = require('express').Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/User');

const saltLength = 10;
let refreshTokens = [];

const authConfig = {
    expireTime: '1d',
    refreshTokenExpireTime: '1d',
};

/**
 * @openapi
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fullname
 *               - email
 *               - password
 *               - role
 *             properties:
 *               fullname:
 *                 type: string
 *                 description: Full name of the user.
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email address of the user.
 *               password:
 *                 type: string
 *                 format: password
 *                 description: User's password.
 *               role:
 *                 type: string
 *                 enum:
 *                   - Citizen
 *                   - Authority
 *                   - Admin
 *                 description: Role of the user (defaults to "Citizen").
 *     tags:
 *       - Auth
 *     responses:
 *       200:
 *         description: User successfully registered.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       description: User ID.
 *                     fullname:
 *                       type: string
 *                       description: Full name of the user.
 *                     email:
 *                       type: string
 *                       format: email
 *                       description: Email address of the user.
 *                     role:
 *                       type: string
 *                       description: Role of the user.
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       description: User creation timestamp.
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       description: Last update timestamp.
 *                 accessToken:
 *                   type: string
 *                   description: JWT access token for the user.
 *                 message:
 *                   type: string
 *                   description: Success message.
 *       400:
 *         description: Registration error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message.
 */

router.post('/register', async (req, res) => {
    try {
        const { fullname, email, password, role, authority } = req.body;

        // Check if email already exists
        const emailExists = await User.findOne({ email });
        if (emailExists) {
            return res.status(400).json({ message: 'This Email already exists.' });
        }

        // Validate Citizen role requires Authority
        if (role === 'Citizen' && !authority) {
            return res.status(400).json({ message: 'Citizen must select an Authority.' });
        }

        // Validate that provided Authority exists
        if (role === 'Citizen') {
            const authorityExists = await User.findOne({ _id: authority, role: 'Authority' });
            if (!authorityExists) {
                return res.status(400).json({ message: 'Invalid Authority selected.' });
            }
        }

        // Hash the password
        const salt = await bcrypt.genSalt(saltLength);
        const hashPassword = await bcrypt.hash(password, salt);

        // Create new user
        const user = new User({
            fullname,
            email,
            password: hashPassword,
            role,
            authority: role === 'Citizen' ? authority : undefined, // Only store if Citizen
        });

        // Save user to database
        const savedUser = await user.save();

        // Create access token
        const accessToken = jwt.sign(
            { _id: savedUser._id, role: savedUser.role },
            process.env.AUTH_TOKEN_SECRET,
            { expiresIn: authConfig.expireTime }
        );

        // Remove password before sending response
        const { password: _, ...userData } = savedUser._doc;

        return res.json({
            user: userData,
            accessToken,
            message: 'User successfully registered',
        });

    } catch (err) {
        return res.status(500).json({ message: 'Internal Server Error', error: err.message });
    }
});


/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     summary: Login a user
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: The user's email address.
 *               password:
 *                 type: string
 *                 format: password
 *                 description: The user's password.
 *     responses:
 *       200:
 *         description: User successfully logged in.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 userData:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       description: User ID.
 *                     email:
 *                       type: string
 *                       format: email
 *                       description: User's email address.
 *                     fullname:
 *                       type: string
 *                       description: Full name of the user.
 *                     role:
 *                       type: string
 *                       description: Role of the user.
 *                     lastLogin:
 *                       type: string
 *                       format: date-time
 *                       description: Last login timestamp.
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       description: User creation timestamp.
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       description: User update timestamp.
 *                 accessToken:
 *                   type: string
 *                   description: JWT access token.
 *                 refreshToken:
 *                   type: string
 *                   description: JWT refresh token.
 *                 status:
 *                   type: string
 *                   description: Status of the operation.
 *       400:
 *         description: Login error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message.
 */

router.post('/login', async (req, res) => {

    const user = await User.findOneAndUpdate({ email: req.body.email }, { lastLogin: new Date() }).select('-__v');
    if (!user) { return res.status(400).send({ message: 'Email provided is not a registered account' }); }
    if (user.role == 'Admin') {
        return res.status(400).send({ message: 'User role is not allowed' });
    }
    const tokenExpiry = req.body.remember ? '30d' : authConfig.expireTime;
    const validPass = await bcrypt.compare(req.body.password, user.password);
    if (!validPass) return res.status(400).send({ message: 'Email or password not found!' });

    // validation passed, create tokens
    const accessToken = jwt.sign({ _id: user._id }, process.env.AUTH_TOKEN_SECRET, { expiresIn: tokenExpiry });
    const refreshToken = jwt.sign({ _id: user._id }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: authConfig.refreshTokenExpireTime });
    refreshTokens.push(refreshToken);

    // remove password
    delete user._doc.password;

    const userData = user;
    const response = {
        userData,
        accessToken,
        refreshToken,
        status: 'success'
    };
    res.cookie('refreshToken', refreshToken, {
        secure: process.env.NODE_ENV !== 'development',
        expires: new Date(new Date().getTime() + 30 * 1440 * 60 * 1000),
        httpOnly: false,
    });
    res.cookie('isLoggedIn', true, {
        secure: process.env.NODE_ENV !== 'development',
        expires: new Date(new Date().getTime() + 30 * 1440 * 60 * 1000),
        httpOnly: false,
    });
    return res.send(response);
});

/**
 * @openapi
 * /api/auth/admin/login:
 *   post:
 *     summary: Admin login endpoint
 *     tags:
 *       - Admin
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: The admin user's email address.
 *               password:
 *                 type: string
 *                 format: password
 *                 description: The admin user's password.
 *     responses:
 *       200:
 *         description: Admin successfully logged in.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 userData:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       description: Admin ID.
 *                     email:
 *                       type: string
 *                       format: email
 *                       description: Admin email address.
 *                     fullname:
 *                       type: string
 *                       description: Full name of the admin.
 *                     role:
 *                       type: string
 *                       description: User role (Admin).
 *                     lastLogin:
 *                       type: string
 *                       format: date-time
 *                       description: Last login timestamp.
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       description: Admin account creation timestamp.
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       description: Admin account update timestamp.
 *                 accessToken:
 *                   type: string
 *                   description: JWT access token.
 *                 status:
 *                   type: string
 *                   description: Operation status (e.g., "success").
 *       400:
 *         description: Login error, such as invalid credentials or unauthorized role.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message.
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message.
 */

router.post('/admin/login', async (req, res) => {

    const user = await User.findOneAndUpdate({ email: req.body.email }, { lastLogin: new Date() }).select('-__v');
    if (!user) { return res.status(400).send({ message: 'Email provided is not a registered account' }); }
    if (user.role !== 'Admin') {
        return res.status(400).send({ message: 'User role is not allowed' });
    }
    const tokenExpiry = req.body.remember ? '30d' : authConfig.expireTime;
    const validPass = await bcrypt.compare(req.body.password, user.password);
    if (!validPass) return res.status(400).send({ message: 'Email or password not found!' });

    // validation passed, create tokens
    const accessToken = jwt.sign({ _id: user._id }, process.env.AUTH_TOKEN_SECRET, { expiresIn: tokenExpiry });
    const refreshToken = jwt.sign({ _id: user._id }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: authConfig.refreshTokenExpireTime });
    refreshTokens.push(refreshToken);

    // remove password
    delete user._doc.password;

    const userData = user;
    const response = {
        userData,
        accessToken,
        status: 'success'
    };
    res.cookie('refreshToken', refreshToken, {
        secure: process.env.NODE_ENV !== 'development',
        expires: new Date(new Date().getTime() + 30 * 1440 * 60 * 1000),
        httpOnly: false,
    });
    res.cookie('isLoggedIn', true, {
        secure: process.env.NODE_ENV !== 'development',
        expires: new Date(new Date().getTime() + 30 * 1440 * 60 * 1000),
        httpOnly: false,
    });
    return res.send(response);
});

/**
 * @openapi
 * /api/auth/refreshToken:
 *   get:
 *     summary: Refresh access token using the refresh token
 *     tags:
 *       - Authentication
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Tokens refreshed successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 userData:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       description: User ID.
 *                     fullname:
 *                       type: string
 *                       description: Full name of the user.
 *                     email:
 *                       type: string
 *                       format: email
 *                       description: User's email address.
 *                     role:
 *                       type: string
 *                       enum:
 *                         - Admin
 *                         - Citizen
 *                         - Authority
 *                       description: Role of the user.
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       description: User account creation timestamp.
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       description: Last account update timestamp.
 *                 accessToken:
 *                   type: string
 *                   description: New JWT access token.
 *       400:
 *         description: User associated with the refresh token not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               example: Refreshing token, user not found.
 *       401:
 *         description: Invalid or expired refresh token.
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               example: Unauthorized.
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message.
 */
router.get('/refreshToken', async (req, res) => {
    const { refreshToken } = req.cookies;
    try {
        const { _id } = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
        // get user
        const userData = await User.findById(_id).select('-__v -password');
        if (!userData) { return res.status(400).send('Refreshing token, user not found'); }

        const newAccessToken = jwt.sign({ _id }, process.env.AUTH_TOKEN_SECRET, { expiresIn: authConfig.expireTime });
        const newRefreshToken = jwt.sign({ _id }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: authConfig.refreshTokenExpireTime });

        //   delete userData.password;
        const response = {
            userData,
            accessToken: newAccessToken,
        };
        res.cookie('refreshToken', newRefreshToken, {
            secure: process.env.NODE_ENV !== 'development',
            expires: new Date(new Date().getTime() + 30 * 1440 * 60 * 1000),
            httpOnly: false,
        });
        res.cookie('isLoggedIn', true, {
            secure: process.env.NODE_ENV !== 'development',
            expires: new Date(new Date().getTime() + 30 * 1440 * 60 * 1000),
            httpOnly: false,
        });
        return res.send(response);
    } catch (e) {
        return res.status(401).send(e);
    }
});

module.exports = router;