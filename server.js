const express = require('express');
const app = express();

const jwt = require('jsonwebtoken');
const { expressjwt: jwtMW } = require('express-jwt');
const bodyParser = require('body-parser');
const path = require('path');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

const PORT = 3000;
const secretKey = 'My super secret key';

const jwtMiddleware = jwtMW({
    secret: secretKey,
    algorithms: ['HS256']
});

// Fake users
let users = [
    { id: 1, username: 'trenity', password: '123' },
    { id: 2, username: 'gilford', password: '456' }
];

// Login route
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;

    const user = users.find(u => u.username === username && u.password === password);

    if (user) {
        const token = jwt.sign(
            { id: user.id, username: user.username },
            secretKey,
            { expiresIn: '3m' }
        );
        res.json({ success: true, err: null, token });
    } else {
        res.status(401).json({ success: false, token: null, err: 'Username or password is incorrect' });
    }
});

// Protected dashboard
app.get('/api/dashboard', jwtMiddleware, (req, res) => {
    console.log(req.auth); 
    res.json({
        success: true,
        myContent: 'Secret content that only logged in people can see!!!'
    });
});

//Protected settings
app.get('/api/settings', jwtMiddleware, (req, res) => {
    console.log(req.auth); 
    res.json({
        success: true,
        myContent: `Hey ${req.auth.username}, this is your settings page!!!`
    });
});

// Serve frontend
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Error handling
app.use((err, req, res, next) => {
    if (err.name === 'UnauthorizedError') {
        res.status(401).json({ success: false, err: 'Invalid or missing token' });
    } else {
        next(err);
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
