export const errorHandler = (error, _request, response, _next) => {
  let statusCode = error.statusCode || 500;
  let message = error.message || 'Internal server error';

  if (error.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(error.errors)
      .map((validationError) => validationError.message)
      .join(', ');
  } else if (error.name === 'CastError') {
    statusCode = 400;
    message = `Invalid ${error.path}`;
  } else if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
    statusCode = 400;
    message = 'Invalid JSON body';
  } else if (error.name === 'MulterError') {
    statusCode = 400;
    message = error.code === 'LIMIT_FILE_SIZE'
      ? (error.field === 'resumeFile' ? 'Resume PDF cannot exceed 10 MB' : 'Image cannot exceed 5 MB')
      : error.message;
  }

  return response.status(statusCode).json({
    success: false,
    message,
  });
};
