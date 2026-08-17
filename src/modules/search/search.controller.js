import * as searchService from './search.service.js';

export const search = async (request, response) => {
  const data = await searchService.search(request.query.q, request.userId);

  return response.status(200).json({
    success: true,
    message: data.query ? 'Search completed successfully' : 'Enter a search term',
    data,
  });
};
