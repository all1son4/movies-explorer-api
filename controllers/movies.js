const Movie = require('../models/movie');
const NotFoundError = require('../errors/not-found-error');
const BadRequestError = require('../errors/bad-request-error');
const ForbiddenError = require('../errors/ForbiddenError');

const getSavedMovies = (req, res, next) => {
  const owner = req.user._id;

  Movie
    .find({ owner })
    .orFail(new NotFoundError(`У пользователя с id ${owner} нет сохраненных фильмов`))
    .then((movies) => res.send(movies))
    .catch((err) => {
      next(err);
    });
};

const createMovie = (req, res, next) => {
  const owner = req.user._id;

  Movie
    .create({ owner, ...req.body })
    .then((movie) => res.send(movie))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new BadRequestError(`${Object.values(err.errors).map((error) => error.message).join(', ')}`));
      } else {
        next(err);
      }
    });
};

const deleteMovie = (req, res, next) => {
  const id = req.params.movieId;

  Movie
    .findById(id)
    .orFail(new NotFoundError('Такой фильм не найден'))
    .then((movie) => {
      if (!movie.owner.equals(req.user._id)) {
        return next(new ForbiddenError('Не трогайте чужие фильмы'));
      }

      return movie.remove();
    })
    .then(() => res.send({ message: 'Фильм удален' }))
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new BadRequestError('Некорректный id'));
      } else {
        next(err);
      }
    });
};

module.exports = {
  getSavedMovies,
  createMovie,
  deleteMovie,
};
