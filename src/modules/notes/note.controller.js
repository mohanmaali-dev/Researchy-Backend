import * as noteService from './note.service.js';

export const createNote = async (request, response) => {
  const note = await noteService.createNote(request.userId, {
    ...request.body,
    image: request.file ? `/uploads/${request.file.filename}` : null,
  });

  return response.status(201).json({
    success: true,
    message: 'Note created successfully',
    data: note,
  });
};

export const getNotes = async (request, response) => {
  const result = await noteService.getNotes(request.userId, request.query);

  return response.status(200).json({
    success: true,
    message: 'Notes fetched successfully',
    data: result.notes,
    pagination: result.pagination,
  });
};

export const getNoteById = async (request, response) => {
  const note = await noteService.getNoteById(request.userId, request.params.id);

  return response.status(200).json({
    success: true,
    message: 'Note fetched successfully',
    data: note,
  });
};

export const updateNote = async (request, response) => {
  const note = await noteService.updateNote(request.userId, request.params.id, {
    ...request.body,
    ...(request.file ? { image: `/uploads/${request.file.filename}` } : {}),
  });

  return response.status(200).json({
    success: true,
    message: 'Note updated successfully',
    data: note,
  });
};

export const deleteNote = async (request, response) => {
  await noteService.deleteNote(request.userId, request.params.id);

  return response.status(200).json({
    success: true,
    message: 'Note deleted successfully',
  });
};
