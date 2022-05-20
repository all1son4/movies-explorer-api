require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const { errors } = require('celebrate');
const helmet = require('helmet')
const cors = require('cors');
const routes = require('./routes');
const errorHandler = require('./middleware/error-handler');
const { requestLogger, errorLogger } = require('./middleware/logger');
const limiter = require('./middleware/rate-limiter')

const { PORT = 3000, DB_ROOT = 'mongodb://localhost:27017/diplomadb' } = process.env;
const app = express();
app.use(helmet());


mongoose.connect(DB_ROOT, {
  useNewUrlParser: true,
});

app.use(cors({
  origin: ['https://localhost:3000',
    'http://localhost:3000',
    'http://api.movieexplorer.allison.nomoredomains.work',
    'https://api.movieexplorer.allison.nomoredomains.work'],
  credentials: true,
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(requestLogger);
app.use(limiter)

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
