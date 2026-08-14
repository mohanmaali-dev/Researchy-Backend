import * as dashboardService from './dashboard.service.js';

export const getDashboard = async (_request, response) => {
  const dashboard = await dashboardService.getDashboard();

  return response.status(200).json({
    success: true,
    message: 'Dashboard fetched successfully',
    data: dashboard,
  });
};
