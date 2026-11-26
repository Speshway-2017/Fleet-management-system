export const notFoundHandler = (_req, res, next) => {
  const error = new Error('Route not found');
  error.statusCode = 404;
  next(error);
};

export const errorHandler = (err, _req, res, _next) => {
  let statusCode = err.statusCode || 500;
  if (
    statusCode === 500 &&
    (err.name === 'MulterError' ||
      String(err.message || '').includes('allowed') ||
      String(err.message || '').includes('signature'))
  ) {
    statusCode = 400;
  }

  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
};
