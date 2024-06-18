<<<<<<< HEAD
require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const swaggerUi = require('swagger-ui-express');
const routes = require('./routes');
const Yaml = require('yaml');
const fs = require('fs');
const path = require('path');
const loadModel = require('../services/loadModel');
const cors = require('cors');
const { firestore, auth } = require('../config/firebase');

const swaggerDocument = Yaml.parse(fs.readFileSync(path.join(__dirname, 'swagger.yaml'), 'utf8'));

(async () => {
    const app = express();
    const port = process.env.PORT || 8085;

    app.use(cors());
    app.use(cookieParser());
    app.use(express.json({ limit: '50mb' }));
    app.use(express.urlencoded({ extended: true, limit: '50mb' }));

    // Middleware to check payload size
    app.use((req, res, next) => {
        if (req.headers['content-length'] > 50000000) {
            return res.status(413).json({
                status: 'fail',
                message: 'Payload content length greater than maximum allowed: 50000000',
            });
        }
        next();
    });

    const model = await loadModel();
    app.locals.model = model;
    app.locals.firestore = firestore;
    app.locals.auth = auth;

    app.use(routes);

    app.use(
        "/api-docs",
        swaggerUi.serve,
        swaggerUi.setup(swaggerDocument)
    );

    app.listen(port, () => {
        console.log(`Server started at: http://localhost:${port}`);
    });
})();
=======
require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const swaggerUi = require('swagger-ui-express');
const routes = require('./routes');
const Yaml = require('yaml');
const fs = require('fs');
const path = require('path');
const loadModel = require('../services/loadModel');
const cors = require('cors');
const { firestore, auth } = require('../config/firebase');

const swaggerDocument = Yaml.parse(fs.readFileSync(path.join(__dirname, 'swagger.yaml'), 'utf8'));

(async () => {
    const app = express();
    const port = process.env.PORT || 8085;

    const corsOptions = {
        origin: '*',
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
        preflightContinue: false,
        optionsSuccessStatus: 204,
    };

    app.use(cors(corsOptions));
    app.use(cookieParser());
    app.use(express.json({ limit: '50mb' }));
    app.use(express.urlencoded({ extended: true, limit: '50mb' }));

    // Middleware to check payload size
    app.use((req, res, next) => {
        if (req.headers['content-length'] > 50000000) {
            return res.status(413).json({
                status: 'fail',
                message: 'Payload content length greater than maximum allowed: 50000000',
            });
        }
        next();
    });

    const model = await loadModel();
    app.locals.model = model;
    app.locals.firestore = firestore;
    app.locals.auth = auth;

    app.use(routes);

    app.use(
        "/api-docs",
        swaggerUi.serve,
        swaggerUi.setup(swaggerDocument, {
            requestInterceptor: (req)=>{
                req.headers['Access-Control-Allow-Origin'] = '*';
                return req;
            }
        })
    );

    app.listen(port, () => {
        console.log(`Server started at: http://localhost:${port}`);
    });
})();
>>>>>>> 3ec16a9 (feat: backup if firebase auth doesn't work)
