const router = require('express').Router();
const { Joi, celebrate } = require('celebrate');

const { getUser,
        updateUser,
        createUser,
        signin,
        signout 
} = require('../controllers/users');

router.get('/me', getUser);
router.patch('/me', celebrate({
  body: Joi.object().keys({
    name: Joi.string().required().min(2).max(30),
    about: Joi.string().required().min(2).max(30),
  }),
}), updateUser);

module.exports = router;