require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const routes = require('./routes');
const loadModel = require('../services/loadModel');
const cors = require('cors');
const { firestore, auth } = require('../config/firebase');

(async () => {
    const app = express();
    const port = process.env.PORT || 8085;

    app.use(cors());
    app.use(cookieParser());
    app.use(express.json({ limit: '1mb' }));
    app.use(express.urlencoded({ extended: true, limit: '1mb' }));

    // Middleware to check payload size
    app.use((req, res, next) => {
        if (req.headers['content-length'] > 1000000) {
            return res.status(413).json({
                status: 'fail',
                message: 'Payload content length greater than maximum allowed: 1000000',
            });
        }
        next();
    });

    const model = await loadModel();
    app.locals.model = model;
    app.locals.firestore = firestore;
    app.locals.auth = auth;
    app.use(routes);

    app.listen(port, () => {
        console.log(`Server started at: http://localhost:${port}`);
    });
})();
