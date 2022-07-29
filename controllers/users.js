const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

const NotFoundError = require('../errors/not-found-error');
const BadRequestError = require('../errors/bad-request-error');
const ConflictError = require('../errors/conflict-error');

const { NODE_ENV, JWT_SECRET } = process.env;

const getUser = (req, res, next) => {
  const id = req.user._id;

  return User
    .findById(id)
    .orFail(new NotFoundError(`Пользователь с id: ${id} не найден`))
    .then((user) => res.status(200)
      .send(user))
    .catch((err) => {
      next(err);
    });
};

const updateUser = (req, res, next) => {
  const id = req.user._id;
  const { name, email } = req.body;

  User
    .findByIdAndUpdate(
      id,
      {
        name,
        email
      },
      {
        new: true,
        runValidators: true
      },
    )
    .orFail(new NotFoundError(`Пользователь с id ${id} не найден`))
    .then((user) => res.send(user))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new BadRequestError(`${Object.values(err.errors)
          .map((error) => error.message)
          .join(', ')}`));
      } else {
        next(err);
      }
    });
};

const createUser = (req, res, next) => {
  const { name, email, password } = req.body;

  bcrypt
    .hash(password, 10)
    .then((hash) => User.create({
      name,
      email,
      password: hash,
    }))
    .then((data) => res.status(201)
      .send(data))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new BadRequestError(`${Object.values(err.errors)
          .map((error) => error.message)
          .join(', ')}`));
      } else if (err.code === 11000) {
        next(new ConflictError('Пользователь с данным email уже существует'));
      } else {
        next(err);
      }
    });
};

const signin = (req, res, next) => {
  const { email, password } = req.body;

  return User
    .findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign({ _id: user._id }, NODE_ENV === 'production' ? JWT_SECRET : 'jwtsecret');

      res.cookie('jwt', token, {
        expires: 3600000 * 24 * 7 + Date.now(),
        httpOnly: true,
        sameSite: 'None',
        secure: true,
        domain: 'api.movieexplorer.allison.nomoredomains.work',
        path: '/'
      })
        .send(user.toJSON());
    })
    .catch(next);
};

const signout = (req, res) => {
  // res.cookie('jwt', 'none', {
  //   maxAge: 1, httpOnly: true, sameSite: 'None', secure: true,
  // })
  // res.clearCookie('jwt').status(200).send({message: "Токен удален"})
  res.cookie('jwt', '', {
    // expire: 3600000 * 24 * 7 + Date.now(),
    expires: new Date(Date.now() + 5 * 1000),
    // maxAge: 5*1000,
    httpOnly: true,
    sameSite: 'None',
    secure: true,
    domain: 'api.movieexplorer.allison.nomoredomains.work',
    path: '/'
  }).status(200).send({message: "Токен удален"};
};

module.exports = {
  getUser,
  updateUser,
  createUser,
  signin,
  signout,
};
