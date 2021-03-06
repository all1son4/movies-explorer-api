require('dotenv')
  .config();

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const { errors } = require('celebrate');
const cors = require('cors');
const routes = require('./routes');
const errorHandler = require('./middleware/error-handler');
const { requestLogger, errorLogger } = require('./middleware/logger');

const { PORT = 3000, DB_ROOT } = process.env;
const app = express();

mongoose.connect(DB_ROOT, {
  useNewUrlParser: true,
});

app.use(cookieParser());

app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://localhost:3000',
    'http://movieexplorer.allison.nomoredomains.xyz',
    'https://movieexplorer.allison.nomoredomains.xyz',
    'https://api.movieexplorer.allison.nomoredomains.work',
    'http://api.movieexplorer.allison.nomoredomains.work'
  ],
  credentials: true,
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(requestLogger);

app.get('/crash-test', () => {
  setTimeout(() => {
    throw new Error('Сервер сейчас упадёт');
  }, 0);
});

app.use(routes);
app.use(errorLogger);
app.use(errors());
app.use(errorHandler);

app.listen(PORT);
