import * as noteService from './note.service.js';

export const createNote = async (request, response) => {
  const note = await noteService.createNote(request.userId, {
    title: request.body.title,
    content: request.body.content,
    image: request.file ? `/uploads/${request.file.filename}` : null,
  });

  return response.status(201).json({
    success: true,
    message: 'Note created successfully',
    data: note,
  });
};

export const getNotes = async (request, response) => {
  const notes = await noteService.getNotes(request.userId);

  return response.status(200).json({
    success: true,
    message: 'Notes fetched successfully',
    data: notes,
  });
};

export const updateNote = async (request, response) => {
  const note = await noteService.updateNote(request.userId, request.params.id, {
    title: request.body.title,
    content: request.body.content,
    image: request.file ? `/uploads/${request.file.filename}` : null,
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
