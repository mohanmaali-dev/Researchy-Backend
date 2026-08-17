import * as dashboardService from './dashboard.service.js';

export const getDashboard = async (request, response) => {
  const dashboard = await dashboardService.getDashboard(request.query.date);

  return response.status(200).json({
    success: true,
    message: 'Dashboard fetched successfully',
    data: dashboard,
  });
};
