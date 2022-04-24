require('dotenv').config();

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

app.use(cors({
  origin: ['https://localhost:3000',
            'http://localhost:3000',
            'http://movieexplorer.allison.api.nomoredomains.work',
            'https://movieexplorer.allison.api.nomoredomains.work'],
  credentials: true,
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
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
