const express        = require('express');
const http           = require('http');        
const cookieParser   = require('cookie-parser');
const bodyParser     = require('body-parser');
const cors           = require('cors');
const path           = require('path');
const mongoose       = require('mongoose');
const dotenv         = require('dotenv');
const swaggerJsDoc   = require('swagger-jsdoc');
const swaggerUI      = require('swagger-ui-express');
const User    = require('./models/User'); 
dotenv.config();

const PORT = process.env.PORT || 3009;
const app  = express();             
const httpServer = http.createServer(app); 

/* ── MongoDB ─────────────────────────────────────────────────────── */
mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log('👓 Connected to DB'))
  .catch(err => console.error('Connection Error →', err.message));

/* ── Middleware ──────────────────────────────────────────────────── */
app.use(bodyParser.json({ limit: '50mb', extended: true }));
app.use(express.static(path.join(__dirname, '/public')));
app.use(express.json());
app.use(cookieParser());

const ALLOWED_ORIGINS = [
  'http://localhost:9000',
  'https://localhost:9000',
];

app.use(
  cors({
    credentials: true,
    origin: ALLOWED_ORIGINS
  })
);

/* ── Routes ──────────────────────────────────────────────────────── */
app.get('/', (req, res) => res.send('CityOps API Server is running!'));

app.use('/api/auth',          require('./routes/auth'));
app.use('/api/users',         require('./routes/users'));
app.use('/api/issues',        require('./routes/issues'));
app.use('/api/teams',         require('./routes/teams'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/comments',      require('./routes/comments'));
app.use('/api/analytics',     require('./routes/analytics'));
app.use('/api/moderation',    require('./routes/moderation'));
app.use('/api/report',        require('./routes/report'));

/* ── Swagger (unchanged) ─────────────────────────────────────────── */
const swaggerOptions = {
  failOnErrors : true,
  definition   : {
    openapi : '3.0.0',
    info    : {
      title       : 'CityOps API',
      version     : '1.0.0',
      description : 'CityOps – Smart Urban Issue Reporting Platform'
    },
    components : {
      securitySchemes : {
        bearerAuth : {
          type          : 'http',
          scheme        : 'bearer',
          bearerFormat  : 'JWT',
          description   : 'Enter JWT token here.'
        }
      }
    },
    security : [ { bearerAuth: [] } ]
  },
  apis: ['./routes/*.js']
};
const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerDocs));

/* ── Export for tests & start server ─────────────────────────────── */
module.exports = { app, httpServer };

if (process.env.NODE_ENV !== 'test') {
  httpServer.listen(PORT, () =>
    console.log(`🛺  API & WS listening on http://localhost:${PORT}`)
  );
}
