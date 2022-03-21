class BadRequestError extends Error {
  constructor(message) {
    super(message || 'Ошибка в запросе');
    this.statusCode = 400;
  }
}

module.exports = BadRequestError;
