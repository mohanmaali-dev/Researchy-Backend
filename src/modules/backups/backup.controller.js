import * as backupService from './backup.service.js';

export const downloadBackup = async (request, response) => {
  const backup = await backupService.createBackup(request.userId);

  return response.status(200).json({
    success: true,
    message: 'Workspace backup created successfully',
    data: backup,
  });
};

export const restoreBackup = async (request, response) => {
  const result = await backupService.restoreBackup(request.body, request.userId);

  return response.status(200).json({
    success: true,
    message: 'Backup restored successfully',
    data: result,
  });
};
