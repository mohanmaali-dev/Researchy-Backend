import * as portfolioService from './portfolio.service.js';
import {
  deleteProfileImage,
  deleteProjectImage,
  deleteResumePdf,
  deleteTestimonialImage,
  saveProfileImage,
  saveProjectImage,
  saveResumePdf,
  saveTestimonialImage,
} from './portfolio-image.service.js';

const ok = (response, message, data, extra = {}) => response.status(200).json({ success: true, message, data, ...extra });

export const createContactMessage = async (request, response) => {
  if (request.body.website) {
    return response.status(201).json({ success: true, message: 'Message sent successfully' });
  }
  const message = await portfolioService.createContactMessage(request.body);
  return response.status(201).json({ success: true, message: 'Message sent successfully', data: { id: message._id } });
};

export const getPublicPortfolio = async (request, response) => ok(response, 'Public portfolio fetched successfully', await portfolioService.getPublicPortfolio(request.params.profileId));

export const getDashboard = async (request, response) => ok(response, 'Portfolio summary fetched successfully', await portfolioService.getDashboard(request.userId));
export const getProfile = async (request, response) => ok(response, 'Portfolio profile fetched successfully', await portfolioService.getProfile(request.userId));
export const saveProfile = async (request, response) => {
  const body = { ...request.body };
  ['showGithub', 'showLinkedin', 'showInstagram', 'showX'].forEach((field) => {
    if (typeof body[field] === 'string') body[field] = body[field] === 'true';
  });
  const currentAssets = await portfolioService.getProfileAssetState(request.userId);
  let image;
  let resume;
  let profile;
  let oldImageWasReplaced;
  let oldResumeWasReplaced;

  try {
    image = await saveProfileImage(request.files?.profileImage?.[0]);
    resume = await saveResumePdf(request.files?.resumeFile?.[0]);

    const removeImage = body.removeProfileImage === true || body.removeProfileImage === 'true';
    const removeResume = body.removeResume === true || body.removeResume === 'true';
    const assetData = {};

    if (image) Object.assign(assetData, image);
    else if (removeImage) Object.assign(assetData, { profileImageUrl: '', profileImagePublicId: '' });
    else if (body.profileImageUrl !== undefined) {
      const nextUrl = String(body.profileImageUrl).trim();
      if (nextUrl !== (currentAssets?.profileImageUrl || '')) {
        Object.assign(assetData, { profileImageUrl: nextUrl, profileImagePublicId: '' });
      }
    }

    if (resume) Object.assign(assetData, resume);
    else if (removeResume) Object.assign(assetData, { resumeUrl: '', resumePublicId: '' });
    else if (body.resumeUrl !== undefined) {
      const nextUrl = String(body.resumeUrl).trim();
      if (nextUrl !== (currentAssets?.resumeUrl || '')) {
        Object.assign(assetData, { resumeUrl: nextUrl, resumePublicId: '' });
      }
    }

    profile = await portfolioService.saveProfile(request.userId, body, assetData);
    oldImageWasReplaced = currentAssets?.profileImagePublicId
      && Object.hasOwn(assetData, 'profileImagePublicId')
      && assetData.profileImagePublicId !== currentAssets.profileImagePublicId;
    oldResumeWasReplaced = currentAssets?.resumePublicId
      && Object.hasOwn(assetData, 'resumePublicId')
      && assetData.resumePublicId !== currentAssets.resumePublicId;
  } catch (error) {
    await Promise.allSettled([
      deleteProfileImage(image?.profileImagePublicId),
      deleteResumePdf(resume?.resumePublicId),
    ]);
    throw error;
  }

  await Promise.allSettled([
    oldImageWasReplaced ? deleteProfileImage(currentAssets.profileImagePublicId) : Promise.resolve(),
    oldResumeWasReplaced ? deleteResumePdf(currentAssets.resumePublicId) : Promise.resolve(),
  ]);
  return ok(response, 'Portfolio profile saved successfully', profile);
};

export const getContactMessages = async (request, response) => {
  const result = await portfolioService.getContactMessages(request.userId, request.query);
  return ok(response, 'Portfolio contact messages fetched successfully', result.messages, { pagination: result.pagination });
};
export const updateContactMessage = async (request, response) => ok(response, 'Contact message updated successfully', await portfolioService.updateContactMessage(request.userId, request.params.id, request.body));
export const deleteContactMessage = async (request, response) => { await portfolioService.deleteContactMessage(request.userId, request.params.id); return ok(response, 'Contact message deleted successfully'); };

export const getProjects = async (request, response) => {
  const result = await portfolioService.getProjects(request.userId, request.query);
  return ok(response, 'Portfolio projects fetched successfully', result.projects, { pagination: result.pagination });
};
export const getProject = async (request, response) => ok(response, 'Portfolio project fetched successfully', await portfolioService.getProject(request.userId, request.params.id));

const projectBody = (body) => {
  const data = { ...body };
  if (typeof data.featured === 'string') data.featured = data.featured === 'true';
  if (typeof data.displayOrder === 'string') data.displayOrder = Number(data.displayOrder);
  if (typeof data.removeImage === 'string') data.removeImage = data.removeImage === 'true';
  return data;
};

export const createProject = async (request, response) => {
  const data = projectBody(request.body);
  const image = await saveProjectImage(request.file);
  try {
    const project = await portfolioService.createProject(request.userId, {
      ...data,
      ...(image || {}),
    });
    return response.status(201).json({
      success: true,
      message: 'Portfolio project created successfully',
      data: project,
    });
  } catch (error) {
    await deleteProjectImage(image?.imagePublicId);
    throw error;
  }
};

export const updateProject = async (request, response) => {
  const currentProject = await portfolioService.getProject(request.userId, request.params.id);
  const data = projectBody(request.body);
  const image = await saveProjectImage(request.file);

  if (image) Object.assign(data, image);
  else if (data.removeImage) {
    data.imageUrl = '';
    data.imagePublicId = '';
  }
  delete data.removeImage;

  try {
    const project = await portfolioService.updateProject(
      request.userId,
      request.params.id,
      data,
    );
    const imageWasReplaced = image || (!project.imagePublicId && currentProject.imagePublicId);
    if (imageWasReplaced) await deleteProjectImage(currentProject.imagePublicId);
    return ok(response, 'Portfolio project updated successfully', project);
  } catch (error) {
    await deleteProjectImage(image?.imagePublicId);
    throw error;
  }
};
export const moveProject = async (request, response) => ok(response, 'Project order updated successfully', await portfolioService.moveProject(request.userId, request.params.id, request.body.direction));
export const deleteProject = async (request, response) => { await portfolioService.deleteProject(request.userId, request.params.id); return ok(response, 'Portfolio project deleted successfully'); };

export const getSkills = async (request, response) => ok(response, 'Portfolio skills fetched successfully', await portfolioService.getSkills(request.userId));
export const createSkill = async (request, response) => response.status(201).json({ success: true, message: 'Portfolio skill created successfully', data: await portfolioService.createSkill(request.userId, request.body) });
export const updateSkill = async (request, response) => ok(response, 'Portfolio skill updated successfully', await portfolioService.updateSkill(request.userId, request.params.id, request.body));
export const deleteSkill = async (request, response) => { await portfolioService.deleteSkill(request.userId, request.params.id); return ok(response, 'Portfolio skill deleted successfully'); };

export const getExperiences = async (request, response) => ok(response, 'Portfolio experience fetched successfully', await portfolioService.getExperiences(request.userId));
export const createExperience = async (request, response) => response.status(201).json({ success: true, message: 'Portfolio experience created successfully', data: await portfolioService.createExperience(request.userId, request.body) });
export const updateExperience = async (request, response) => ok(response, 'Portfolio experience updated successfully', await portfolioService.updateExperience(request.userId, request.params.id, request.body));
export const deleteExperience = async (request, response) => { await portfolioService.deleteExperience(request.userId, request.params.id); return ok(response, 'Portfolio experience deleted successfully'); };

export const getEducations = async (request, response) => ok(response, 'Portfolio education fetched successfully', await portfolioService.getEducations(request.userId));
export const createEducation = async (request, response) => response.status(201).json({ success: true, message: 'Portfolio education created successfully', data: await portfolioService.createEducation(request.userId, request.body) });
export const updateEducation = async (request, response) => ok(response, 'Portfolio education updated successfully', await portfolioService.updateEducation(request.userId, request.params.id, request.body));
export const deleteEducation = async (request, response) => { await portfolioService.deleteEducation(request.userId, request.params.id); return ok(response, 'Portfolio education deleted successfully'); };

export const getCertifications = async (request, response) => ok(response, 'Portfolio certifications fetched successfully', await portfolioService.getCertifications(request.userId));
export const createCertification = async (request, response) => response.status(201).json({ success: true, message: 'Portfolio certification created successfully', data: await portfolioService.createCertification(request.userId, request.body) });
export const updateCertification = async (request, response) => ok(response, 'Portfolio certification updated successfully', await portfolioService.updateCertification(request.userId, request.params.id, request.body));
export const deleteCertification = async (request, response) => { await portfolioService.deleteCertification(request.userId, request.params.id); return ok(response, 'Portfolio certification deleted successfully'); };

export const getServices = async (request, response) => ok(response, 'Portfolio services fetched successfully', await portfolioService.getServices(request.userId));
export const createService = async (request, response) => response.status(201).json({ success: true, message: 'Portfolio service created successfully', data: await portfolioService.createService(request.userId, request.body) });
export const updateService = async (request, response) => ok(response, 'Portfolio service updated successfully', await portfolioService.updateService(request.userId, request.params.id, request.body));
export const deleteService = async (request, response) => { await portfolioService.deleteService(request.userId, request.params.id); return ok(response, 'Portfolio service deleted successfully'); };

export const getTestimonials = async (request, response) => ok(response, 'Portfolio testimonials fetched successfully', await portfolioService.getTestimonials(request.userId));
const testimonialBody = (body) => {
  const data = { ...body };
  if (typeof data.featured === 'string') data.featured = data.featured === 'true';
  if (typeof data.displayOrder === 'string') data.displayOrder = Number(data.displayOrder);
  if (typeof data.removeImage === 'string') data.removeImage = data.removeImage === 'true';
  return data;
};
export const createTestimonial = async (request, response) => {
  const data = testimonialBody(request.body);
  const image = await saveTestimonialImage(request.file);
  try {
    const testimonial = await portfolioService.createTestimonial(request.userId, { ...data, ...(image || {}) });
    return response.status(201).json({ success: true, message: 'Portfolio testimonial created successfully', data: testimonial });
  } catch (error) {
    await deleteTestimonialImage(image?.imagePublicId);
    throw error;
  }
};
export const updateTestimonial = async (request, response) => {
  const current = await portfolioService.getTestimonial(request.userId, request.params.id);
  const data = testimonialBody(request.body);
  const image = await saveTestimonialImage(request.file);
  if (image) Object.assign(data, image);
  else if (data.removeImage) Object.assign(data, { imageUrl: '', imagePublicId: '' });
  delete data.removeImage;
  try {
    const testimonial = await portfolioService.updateTestimonial(request.userId, request.params.id, data);
    if (image || (!testimonial.imagePublicId && current.imagePublicId)) await deleteTestimonialImage(current.imagePublicId);
    return ok(response, 'Portfolio testimonial updated successfully', testimonial);
  } catch (error) {
    await deleteTestimonialImage(image?.imagePublicId);
    throw error;
  }
};
export const deleteTestimonial = async (request, response) => {
  const testimonial = await portfolioService.deleteTestimonial(request.userId, request.params.id);
  await deleteTestimonialImage(testimonial.imagePublicId);
  return ok(response, 'Portfolio testimonial deleted successfully');
};

export const bulkDelete = async (request, response) => ok(
  response,
  'Selected Portfolio records deleted successfully',
  await portfolioService.bulkDelete(request.userId, request.body.entity, request.body.ids),
);
