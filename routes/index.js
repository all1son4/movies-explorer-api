const router = require('express').Router();
const { Joi, celebrate } = require('celebrate');
const userRouter = require('./users');
const movieRouter = require('./movies');
const auth = require('../middleware/auth');
const { createUser, signin, signout } = require('../controllers/users');
const NotFoundError = require('../errors/not-found-error');

const urlPattern = /^((http|https|ftp):\/\/)?(([A-Z0-9][A-Z0-9_-]*)(\.[A-Z0-9][A-Z0-9_-]*)+)/i;

router.post('/signup', celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required().min(8),
    name: Joi.string().required().min(2).max(30),
  }),
}), createUser);

router.post('/signin', celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required().min(8),
  }),
}), signin);

router.post('/signout', signout);
router.use(auth);
router.use('/users', userRouter);
router.use('/movies', movieRouter);

router.use((req, res, next) => {
  next(new NotFoundError(`Ресурс по адресу "${req.path}" не найден`));
});

module.exports = router;
