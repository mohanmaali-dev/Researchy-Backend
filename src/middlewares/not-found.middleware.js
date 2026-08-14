export const notFoundHandler = (request, response) => {
  return response.status(404).json({
    success: false,
    message: `Route ${request.method} ${request.originalUrl} not found`,
  });
};
