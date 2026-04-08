//var session = require('express-session');
require('dotenv-flow').config();

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const app = express();
console.log(process.env.FRONT_END_URL);
const allowedOriginsRaw = (process.env.FRONT_END_URL || '')
  .split(',')
  .map(origin => origin.trim())
  .filter(Boolean);

const normalizeOrigin = (origin) => {
  if (!origin) return origin;
  return origin.replace(/\/$/, '').toLowerCase();
};

const allowAllOrigins =
  allowedOriginsRaw.length === 0 ||
  allowedOriginsRaw.some(value => ['*', 'all'].includes(value.toLowerCase()));

const fallbackDevOrigins = [
  'http://localhost:3000',
  'http://localhost:8080',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:8080',
];

const allowedOriginsNormalized = (allowAllOrigins ? [] : allowedOriginsRaw)
  .map(normalizeOrigin)
  .filter(Boolean);

const effectiveAllowedOrigins = allowAllOrigins
  ? []
  : (allowedOriginsNormalized.length ? allowedOriginsNormalized : fallbackDevOrigins);

if (!allowAllOrigins) {
  console.log('CORS allowlist:', effectiveAllowedOrigins);
} else {
  console.log('CORS allowlist: * (all origins permitted)');
}

const corsOptions = {
  origin: allowAllOrigins
    ? true
    : (origin, callback) => {
        if (!origin) {
          return callback(null, true);
        }
        const normalizedOrigin = normalizeOrigin(origin);
        if (effectiveAllowedOrigins.includes(normalizedOrigin)) {
          return callback(null, true);
        }
        console.warn('Blocked CORS origin:', origin);
        return callback(new Error('Not allowed by CORS'));
      },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

const port = process.env.PORT;

// example route (index.js file in routes)
var indexRouter = require('./routes/index');
// add new routes here
var buildRouter = require('./routes/build');

// example route
app.use('/', indexRouter);
// add new routes here
app.use('/build', buildRouter);

app.get('/tempFiles/:filename', (req, res) => {
    const filename = req.params.filename;
    const fullPath = path.join(__dirname, 'tempFiles', filename);

    res.download(fullPath, filename, (err) => {
        if (err) {
            console.error("Download error:", err);
            res.status(404).json({ message: "File not found" });
        }
    });
});

// Setup express-session (currently redacted)
// app.use(session({
//   name: 'sessionId', // Change this to a secure name
//   secret: 'secret', // Change this to a secure key
//   resave: false,
//   saveUninitialized: false,
//   cookie: {
//     httpOnly: true,
//     secure: false, // Set to true in production with HTTPS
//     maxAge: 1000 * 60 * 60 * 24, // 1 day
//     sameSite: 'Lax', // Use 'None' if you want to allow cross-origin cookies
//   }
// }));

var server = app.listen(port, () => {
  console.log(`Schema-Build listening on port ${port}`)
})

module.exports = {app, server};