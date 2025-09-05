const express = require('express');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUI = require('swagger-ui-express');

dotenv.config();

const app = express();

const PORT = process.env.PORT || 3009;

// Connect to DB
mongoose.connect(process.env.MONGO_URL)
    .then(() => {
        // Connection successful
        console.log('👓 Connected to DB')
    })
    .catch((error) => {
        // Handle connection error
        console.log('Connection Error => : ', error.message)
    });

// Import routes
const authRoute = require('./routes/auth');
const userRoute = require('./routes/users');
const issueRoute = require('./routes/issues');
const teamRoute = require('./routes/teams');

// Increase parse limit
app.use(bodyParser.json({ limit: '50mb', extended: true }));
app.use(express.static(path.join(__dirname, '/public')));

// Middleware
app.use(
    cors({
        credentials: true,
        origin: [
            'http://localhost:9000'
        ],
    }),
);

app.use(express.json());
app.use(cookieParser());

// Route middleware
app.get('/', (req, res) => {
    res.send('CityOps API Server is running!');
});

app.use('/api/auth', authRoute);
app.use('/api/users', userRoute);
app.use('/api/issues', issueRoute);
app.use('/api/teams', teamRoute);

// Extended: https://swagger.io/specification/#infoObject
const swaggerOptions = {
    failOnErrors: true,
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'CityOps API',
            version: '1.0.0',
            description: 'CityOps - Smart Urban Issue Reporting Platform'
        },
        components: {
          securitySchemes: {
            bearerAuth: {
              type: 'http',
              scheme: 'bearer',
              bearerFormat: 'JWT',
              description: 'Enter your JWT token inside this field to authenticate your requests. The format should be: {your_token_here}'
            }
          }
        },
        security: [{
          bearerAuth: []
        }]
    },
    apis: ['./routes/*.js'], // Adjust the path to reflect where your route files are located
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerDocs));

app.listen(PORT, () => console.log(`🛺  API Server UP and Running at ${process.env.SERVER_URL}`));
