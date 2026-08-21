import {
  PortfolioCertification,
  PortfolioEducation,
  PortfolioExperience,
  PortfolioProfile,
  PortfolioProject,
  PortfolioService,
  PortfolioSkill,
  PortfolioTestimonial,
} from '../portfolio/portfolio.model.js';

const projects = [
  { title: 'BES Price Calculator', shortDescription: 'Stock management system for products, stock levels, automatic price calculations, and reports.', description: 'Includes an admin dashboard for monitoring stock, generating reports, and updating records in real time.', projectType: 'Dashboard', projectSource: 'Personal Project', technologies: ['Next.js', 'NestJS', 'MongoDB', 'Node.js'], githubUrl: 'https://github.com/Mohanmaali144', imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop', featured: true },
  { title: 'CARMUCHO', shortDescription: 'Car rental platform with listings, browsing, booking, real-time chat, and secure payments.', description: 'Users can list cars for rent while others browse and book based on their preferences.', projectType: 'SaaS', projectSource: 'Personal Project', technologies: ['React.js', 'Next.js', 'Node.js', 'NestJS', 'MongoDB'], githubUrl: 'https://github.com/Mohanmaali144', imageUrl: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?q=80&w=2070&auto=format&fit=crop', featured: true },
  { title: 'CodeFlow CMS', shortDescription: 'Modular headless CMS with RBAC, dynamic content types, media uploads, JWT, and Redis caching.', projectType: 'SaaS', projectSource: 'Personal Project', technologies: ['Next.js', 'NestJS', 'MongoDB', 'Redis', 'JWT'], githubUrl: 'https://github.com/Mohanmaali144', imageUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=2070&auto=format&fit=crop' },
  { title: 'Real-Time Help Request Platform', shortDescription: 'Community assistance platform with help requests, applications, live notifications, and role dashboards.', projectType: 'SaaS', projectSource: 'Personal Project', technologies: ['Next.js', 'NestJS', 'Socket.io', 'MongoDB'], githubUrl: 'https://github.com/Mohanmaali144', imageUrl: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2070&auto=format&fit=crop' },
  { title: 'Scrapify Marketplace', shortDescription: 'Marketplace for scrap and second-hand products with approval, pickup, payment, and order tracking.', projectType: 'E-commerce', projectSource: 'Personal Project', technologies: ['Next.js', 'NestJS', 'MongoDB', 'Stripe API'], githubUrl: 'https://github.com/Mohanmaali144', imageUrl: 'https://images.unsplash.com/photo-1492724441997-5dc865305da7?q=80&w=2070&auto=format&fit=crop', featured: true },
  { title: 'Salon Appointment Booking System', shortDescription: 'Service booking platform with staff availability, conflict prevention, dashboards, and online payments.', projectType: 'SaaS', projectSource: 'Personal Project', technologies: ['Next.js', 'NestJS', 'MongoDB', 'JWT', 'Payment Gateway'], githubUrl: 'https://github.com/Mohanmaali144', imageUrl: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=2070&auto=format&fit=crop', featured: true },
  { title: 'Contact Relationship Manager', shortDescription: 'A simple system for contacts, relationship notes, and follow-up dates.', projectType: 'Dashboard', projectSource: 'Personal Project', technologies: ['React', 'Node.js', 'MongoDB'] },
  { title: 'Inventory Workflow Dashboard', shortDescription: 'Sample dashboard for stock visibility, purchase tracking, and delayed updates.', projectType: 'Dashboard', projectSource: 'Personal Project', technologies: ['React', 'Express', 'MongoDB'] },
  { title: 'Quotation Management System', shortDescription: 'Sample workflow for preparing, reviewing, and tracking customer quotations.', projectType: 'Business Website', projectSource: 'Personal Project', technologies: ['React', 'Node.js', 'MongoDB'] },
  { title: 'Follow-up Tracker', shortDescription: 'Sample reminder system for pending, upcoming, completed, and overdue follow-ups.', projectType: 'SaaS', projectSource: 'Personal Project', technologies: ['React', 'Express', 'MongoDB'] },
].map((item, displayOrder) => ({ ...item, status: 'Draft', displayOrder }));

const skills = [
  ['React', 'Frontend'], ['JavaScript', 'Frontend'], ['Tailwind CSS', 'Frontend'], ['Node.js', 'Backend'], ['Express', 'Backend'],
  ['MongoDB', 'Database'], ['Mongoose', 'Database'], ['REST APIs', 'Backend'], ['Git & GitHub', 'Tools'], ['AI & Automation', 'AI & Automation'],
].map(([name, category], displayOrder) => ({ name, normalizedName: name.toLocaleLowerCase(), category, displayOrder, visible: false }));

const experiences = [
  { company: 'IBR Infotech', position: 'MERN Stack Developer', location: 'India', startDate: '2025-08', currentlyWorking: true, description: 'Developing and maintaining client-facing web applications using the MERN stack.', achievements: ['Collaborated with cross-functional teams to understand client requirements.', 'Translated business needs into technical solutions.', 'Participated in code reviews and resolved issues in live projects.'] },
  { company: 'Foduu', position: 'MERN Stack Developer', location: 'India', startDate: '2024-07', endDate: '2025-08', description: 'Developed full-stack applications using Next.js, NestJS, and MongoDB.', achievements: ['Designed REST APIs and integrated frontend and backend services.', 'Worked on database modeling, authentication, and performance improvements.', 'Debugged production issues and improved application stability.'] },
  ...Array.from({ length: 8 }, (_, index) => ({ company: `Sample Company ${String(index + 1).padStart(2, '0')}`, position: `Sample Development Role ${String(index + 1).padStart(2, '0')}`, location: 'Indore, Madhya Pradesh, India', startDate: `202${index % 4}-0${(index % 9) + 1}`, endDate: `202${(index % 4) + 1}-1${index % 3}`, description: 'Sample work-history record for testing the portfolio layout.', achievements: ['Sample achievement for layout preview.'] })),
].map((item, displayOrder) => ({ ...item, status: 'Draft', displayOrder }));

const educations = [
  { institution: 'Harda Adarsh College, Barkatullah University', degree: 'Bachelor of Computer Application (BCA)', fieldOfStudy: 'Computer Applications', location: 'Bhopal, India', startDate: '2024-01', currentlyStudying: true, description: 'Bachelor’s degree focused on full-stack development and computer applications.', achievements: ['Working on real-world client projects alongside studies.', 'Building expertise in MERN stack technologies.'] },
  { institution: 'Government Hr. Sec. School, Vikrampur', degree: 'Higher Secondary Certificate', fieldOfStudy: 'Biology Stream', location: 'Vikrampur, India', startDate: '2021-01', endDate: '2022-12', description: 'Higher secondary education in the Biology stream.', achievements: ['Scored 62% in HSC examinations.'] },
  ...Array.from({ length: 8 }, (_, index) => ({ institution: `Sample Institute ${String(index + 1).padStart(2, '0')}`, degree: `Sample Qualification ${String(index + 1).padStart(2, '0')}`, fieldOfStudy: 'Computer Science', location: 'Madhya Pradesh, India', startDate: `201${index}-07`, endDate: `202${index % 5}-05`, description: 'Sample education record for testing the portfolio layout.', achievements: ['Sample academic achievement.'] })),
].map((item, displayOrder) => ({ ...item, status: 'Draft', displayOrder }));

const certifications = Array.from({ length: 10 }, (_, index) => ({
  name: `Sample Web Development Certification ${String(index + 1).padStart(2, '0')}`,
  issuingOrganization: `Sample Learning Platform ${String((index % 3) + 1).padStart(2, '0')}`,
  issueDate: `202${index % 6}-${String((index % 9) + 1).padStart(2, '0')}`,
  doesNotExpire: true,
  description: 'Sample certification for testing the portfolio credentials section.',
  status: 'Draft',
  displayOrder: index,
}));

const services = [
  ['Full-Stack Development', 'Full Stack'], ['AI & Automation', 'Automation'], ['REST API Design', 'Backend & API'],
  ['Web Applications', 'Web Development'], ['UI & Design', 'Frontend'], ['MERN Application Development', 'Full Stack'],
  ['Website Performance Improvement', 'Consulting'], ['Workflow Automation Consulting', 'Automation'], ['Portfolio Website Development', 'Web Development'],
  ['Application Maintenance', 'Consulting'],
].map(([title, serviceType], displayOrder) => ({ title, serviceType, shortDescription: `${title} with a clean, responsive, and maintainable implementation.`, description: `A fixed sample service based on Mohan's MERN stack and web-development portfolio.`, features: ['Responsive interface', 'Clean code structure', 'API integration'], priceLabel: 'Contact for estimate', deliveryTime: 'Based on scope', featured: displayOrder < 3, status: 'Draft', displayOrder }));

const testimonials = Array.from({ length: 10 }, (_, index) => ({
  personName: `Sample Client ${String(index + 1).padStart(2, '0')}`,
  personRole: 'Sample Reviewer',
  company: `Sample Organization ${String((index % 4) + 1).padStart(2, '0')}`,
  message: 'This is sample testimonial content for checking the admin and portfolio layout. Replace it with genuine client feedback before publishing.',
  featured: index < 3,
  status: 'Draft',
  displayOrder: index,
}));

const insertMissing = async (model, records, userId, keyFields) => {
  await Promise.all(records.map((record) => model.updateOne(
    { user: userId, ...Object.fromEntries(keyFields.map((field) => [field, record[field]])) },
    { $setOnInsert: { user: userId, ...record } },
    { upsert: true },
  )));
};

export const upsertDemoPortfolioData = async (userId) => {
  let profile = await PortfolioProfile.findOne({ user: userId });
  if (!profile) profile = new PortfolioProfile({ user: userId });
  const verifiedProfile = {
    fullName: 'Mohan Maali',
    professionalTitle: 'MERN Stack Developer & AI Engineer',
    shortBio: 'Full-stack developer building practical web applications, dashboards, and automation workflows.',
    about: 'I work with React, Node.js, Express, and MongoDB to turn real workflows into clean and useful software.',
    location: 'Indore, Madhya Pradesh, India',
    email: 'mohanmaali144@gmail.com',
    phone: '9329094633',
    whatsappNumber: '919329094633',
    githubUrl: 'https://github.com/mohanmaali144',
    linkedinUrl: 'https://www.linkedin.com/in/mohan-maali',
    instagramUrl: 'https://www.instagram.com/____mohan__maali____',
    xUrl: 'https://x.com/Mohan_oon',
  };
  Object.entries(verifiedProfile).forEach(([field, value]) => { if (!profile[field]) profile[field] = value; });
  await profile.save();

  await Promise.all([
    insertMissing(PortfolioProject, projects, userId, ['title']),
    insertMissing(PortfolioSkill, skills, userId, ['normalizedName']),
    insertMissing(PortfolioExperience, experiences, userId, ['company', 'position']),
    insertMissing(PortfolioEducation, educations, userId, ['institution', 'degree']),
    insertMissing(PortfolioCertification, certifications, userId, ['name', 'issuingOrganization']),
    insertMissing(PortfolioService, services, userId, ['title']),
    insertMissing(PortfolioTestimonial, testimonials, userId, ['personName']),
  ]);

  return {
    profile: 1,
    projects: projects.length,
    skills: skills.length,
    experiences: experiences.length,
    educations: educations.length,
    certifications: certifications.length,
    services: services.length,
    testimonials: testimonials.length,
  };
};
