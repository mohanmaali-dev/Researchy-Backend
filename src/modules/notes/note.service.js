import fs from 'node:fs/promises';
import path from 'node:path';

import { Note } from './note.model.js';

const createError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const removeImage = async (image) => {
  if (!image) return;

  try {
    await fs.unlink(path.join(process.cwd(), image));
  } catch {
    return;
  }
};

export const createNote = async (userId, data) => {
  if (!data.title?.trim()) {
    throw createError('Title is required', 400);
  }

  return Note.create({ user: userId, ...data });
};

export const getNotes = (userId) => Note.find({ user: userId }).sort({ createdAt: -1 }).lean();

export const updateNote = async (userId, noteId, data) => {
  const note = await Note.findOne({ _id: noteId, user: userId });

  if (!note) {
    throw createError('Note not found', 404);
  }

  if (data.title !== undefined && !data.title.trim()) {
    throw createError('Title is required', 400);
  }

  if (data.title !== undefined) note.title = data.title;
  if (data.content !== undefined) note.content = data.content;

  if (data.image) {
    await removeImage(note.image);
    note.image = data.image;
  }

  await note.save();
  return note;
};

export const deleteNote = async (userId, noteId) => {
  const note = await Note.findOneAndDelete({ _id: noteId, user: userId });

  if (!note) {
    throw createError('Note not found', 404);
  }

  await removeImage(note.image);
};
