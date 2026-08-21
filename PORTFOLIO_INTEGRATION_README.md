# Portfolio Website Integration Guide

This document explains how to connect the public portfolio website to the Portfolio module in 3V Workspace.

The admin application and backend are already prepared. The public portfolio website should be updated later by following this guide.

## What is already available

The admin application can manage:

- Profile information
- Profile image and resume
- Contact information and social links
- Projects
- Skills
- Experience
- Education
- Certifications
- Services
- Testimonials
- Contact-form messages
- Published, draft, visible, and hidden content

The backend provides two public endpoints:

```text
GET  /api/portfolio/public/:profileId
POST /api/portfolio/contact-submissions
```

These endpoints do not require authentication.

## 1. Find the Profile ID and API endpoints

1. Sign in to 3V Workspace.
2. Open **Portfolio → Overview**.
3. Find the **Future website integration** section.
4. Copy the Portfolio data endpoint.
5. Copy the Contact form endpoint.
6. Copy the Profile ID shown below the endpoints.

The Profile ID identifies which admin profile belongs to the public website.

## 2. Add environment variables to the portfolio website

For a React and Vite portfolio, create or update its `.env` file:

```env
VITE_PORTFOLIO_API_URL=https://your-backend-domain.vercel.app/api
VITE_PORTFOLIO_PROFILE_ID=your_profile_id
```

Also add the same values to the public portfolio project in Vercel:

1. Open the portfolio project in Vercel.
2. Open **Settings → Environment Variables**.
3. Add `VITE_PORTFOLIO_API_URL`.
4. Add `VITE_PORTFOLIO_PROFILE_ID`.
5. Redeploy the portfolio website.

Do not put database passwords, Cloudinary secrets, JWT secrets, or other private credentials in the portfolio frontend.

## 3. Allow the portfolio domain in the backend

The deployed backend must allow both the admin application and public portfolio origins.

Set `CORS_ORIGINS` in the backend deployment:

```env
CORS_ORIGINS=https://your-admin.vercel.app,https://mohanmaali.vercel.app
```

Do not add a trailing slash to these origins.

Redeploy the backend after changing this environment variable.

## 4. Create a portfolio API service

Add a small service file to the public portfolio project.

Example: `src/services/portfolioApi.js`

```js
const API_URL = import.meta.env.VITE_PORTFOLIO_API_URL
const PROFILE_ID = import.meta.env.VITE_PORTFOLIO_PROFILE_ID

const readResponse = async (response) => {
  const result = await response.json().catch(() => ({}))

  if (!response.ok || !result.success) {
    throw new Error(result.message || 'Unable to complete the request')
  }

  return result
}

export const getPortfolioData = async () => {
  const response = await fetch(
    `${API_URL}/portfolio/public/${PROFILE_ID}`,
  )

  const result = await readResponse(response)
  return result.data
}

export const sendPortfolioMessage = async (formData) => {
  const response = await fetch(`${API_URL}/portfolio/contact-submissions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      profileId: PROFILE_ID,
      fullName: formData.fullName,
      email: formData.email,
      phone: formData.phone || '',
      subject: formData.subject || '',
      message: formData.message,
      website: formData.website || '',
    }),
  })

  return readResponse(response)
}
```

The `website` field is a hidden spam-protection field. Real users should leave it empty.

## 5. Understand the public portfolio response

The portfolio data endpoint returns:

```json
{
  "success": true,
  "message": "Public portfolio fetched successfully",
  "data": {
    "profile": {},
    "projects": [],
    "skills": [],
    "experiences": [],
    "educations": [],
    "certifications": [],
    "services": [],
    "testimonials": []
  }
}
```

### Profile data

The `profile` object can contain:

- `fullName`
- `professionalTitle`
- `shortBio`
- `about`
- `email`
- `phone`
- `location`
- `profileImageUrl`
- `resumeUrl`
- `githubUrl`
- `linkedinUrl`
- `instagramUrl`
- `xUrl`
- `whatsappNumber`
- `whatsappMessage`
- `availabilityText`

Social links hidden from the admin are returned as empty values.

### Services

Only services with the `Published` status are returned. They are sorted by the display order set in the admin.

Important service fields include:

- `title`
- `shortDescription`
- `description`
- `serviceType`
- `features`
- `priceLabel`
- `deliveryTime`
- `featured`
- `displayOrder`

### Projects

Only projects with the `Published` status are returned. They are already sorted using the order selected in the admin application.

Important project fields include:

- `title`
- `shortDescription`
- `description`
- `projectType`
- `customProjectType`
- `projectSource`
- `organizationName`
- `technologies`
- `githubUrl`
- `liveUrl`
- `imageUrl`
- `featured`
- `displayOrder`

### Skills

Only visible skills are returned.

Important fields include:

- `name`
- `category`
- `displayOrder`

### Testimonials

Only testimonials with the `Published` status are returned. They are sorted using the display order from the admin.

Important testimonial fields include:

- `personName`
- `personRole`
- `company`
- `message`
- `imageUrl`
- `featured`
- `displayOrder`

### Experience

Only experience entries with the `Published` status are returned.

Important fields include:

- `company`
- `position`
- `location`
- `startDate`
- `endDate`
- `currentlyWorking`
- `description`
- `achievements`
- `displayOrder`

### Education

Only education entries with the `Published` status are returned.

Important fields include:

- `institution`
- `degree`
- `fieldOfStudy`
- `location`
- `startDate`
- `endDate`
- `currentlyStudying`
- `description`
- `achievements`
- `displayOrder`

### Certifications

Only certifications with the `Published` status are returned.

Important fields include:

- `name`
- `issuingOrganization`
- `issueDate`
- `expirationDate`
- `doesNotExpire`
- `credentialId`
- `credentialUrl`
- `description`
- `displayOrder`

## 6. Load the data in React

The simplest approach is to load the complete portfolio payload once near the top of the public application.

```jsx
import { useEffect, useState } from 'react'
import { getPortfolioData } from './services/portfolioApi'

function App() {
  const [portfolio, setPortfolio] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    getPortfolioData()
      .then((data) => {
        if (active) setPortfolio(data)
      })
      .catch((requestError) => {
        if (active) setError(requestError.message)
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  if (loading) return <PortfolioLoading />
  if (error) return <PortfolioError message={error} />

  return (
    <>
      <Hero profile={portfolio.profile} />
      <About profile={portfolio.profile} />
      <Projects projects={portfolio.projects} />
      <Skills skills={portfolio.skills} />
      <Experience experiences={portfolio.experiences} />
      <Education educations={portfolio.educations} />
      <Certifications certifications={portfolio.certifications} />
      <Contact profile={portfolio.profile} />
    </>
  )
}
```

Keep the loading and error states simple. Do not leave the page blank while the API request is running.

## 7. Replace static data gradually

Do not rewrite the complete portfolio website at once.

Use this order:

1. Connect the API and log the returned data.
2. Replace the static profile and hero information.
3. Replace the static About information.
4. Replace the static projects.
5. Replace skills.
6. Replace experience.
7. Replace education and certifications.
8. Connect social links and the resume.
9. Connect the contact form.
10. Remove unused static data only after every section works.

During migration, static data can be used as a temporary fallback:

```js
const projects = portfolio?.projects?.length
  ? portfolio.projects
  : staticProjects
```

Remove the fallback after the API integration has been tested in production.

## 8. Render images correctly

New Cloudinary uploads return full HTTPS addresses and can be used directly:

```jsx
<img src={project.imageUrl} alt={project.title} />
```

If old data contains an `/uploads/...` address, resolve it against the backend domain:

```js
export const resolveAssetUrl = (value) => {
  if (!value) return ''
  if (/^https?:\/\//i.test(value)) return value

  const apiUrl = import.meta.env.VITE_PORTFOLIO_API_URL
  const backendOrigin = new URL(apiUrl).origin
  return `${backendOrigin}${value.startsWith('/') ? '' : '/'}${value}`
}
```

Use meaningful image alternative text:

```jsx
<img
  src={resolveAssetUrl(project.imageUrl)}
  alt={`${project.title} project preview`}
/>
```

## 9. Connect the contact form

Recommended public form fields:

- Name, required
- Email, required
- Phone, optional and digits only
- Subject, optional
- Message, required

Example React submission:

```jsx
const [submitting, setSubmitting] = useState(false)
const [success, setSuccess] = useState('')
const [error, setError] = useState('')

const submitContactForm = async (event) => {
  event.preventDefault()
  setSubmitting(true)
  setSuccess('')
  setError('')

  try {
    await sendPortfolioMessage(form)
    setSuccess('Your message has been sent successfully.')
    setForm({
      fullName: '',
      email: '',
      phone: '',
      subject: '',
      message: '',
      website: '',
    })
  } catch (requestError) {
    setError(requestError.message)
  } finally {
    setSubmitting(false)
  }
}
```

Add the hidden spam field outside the visible form layout:

```jsx
<label className="sr-only" aria-hidden="true">
  Website
  <input
    name="website"
    value={form.website}
    onChange={handleChange}
    tabIndex="-1"
    autoComplete="off"
  />
</label>
```

After submission, the message will appear under **Portfolio → Messages** in the admin application.

Opening a new message marks it as read. It can also be changed back to new or permanently deleted.

## 10. Contact-form validation

The backend validates the submission again, but the public form should also provide immediate validation.

Rules:

- Name cannot be empty.
- Email must be valid.
- Phone must contain 7 to 15 digits when provided.
- Message cannot be empty.
- Do not allow repeated submissions while a request is running.

The public contact endpoint permits five messages per IP address every fifteen minutes.

When the limit is exceeded, the API returns:

```json
{
  "success": false,
  "message": "Too many contact messages. Please try again later"
}
```

Show this message to the visitor in a simple error state.

## 11. Group skills by category

The backend returns a flat skills list. Group it in the portfolio frontend when required:

```js
const skillGroups = skills.reduce((groups, skill) => {
  if (!groups[skill.category]) groups[skill.category] = []
  groups[skill.category].push(skill)
  return groups
}, {})
```

Then render each category separately.

## 12. Resume and social links

Only show a link when its value exists:

```jsx
{profile.resumeUrl && (
  <a href={profile.resumeUrl} target="_blank" rel="noreferrer">
    View resume
  </a>
)}
```

Use the same conditional approach for GitHub, LinkedIn, Instagram, X, email, phone, and WhatsApp.

Do not display an empty button when a value is missing or hidden.

## 13. WhatsApp link

Create the WhatsApp address from the stored number and message:

```js
const whatsappUrl = profile.whatsappNumber
  ? `https://wa.me/${profile.whatsappNumber}?text=${encodeURIComponent(
      profile.whatsappMessage || 'Hello',
    )}`
  : ''
```

The admin stores the number as digits only, including the country code.

## 14. Preview before connecting the public website

The admin application contains **Portfolio → Preview**.

This preview shows:

- Published projects
- Visible skills
- Published experience
- Visible social links
- Current profile information

Use it to confirm the data before updating the external portfolio website.

The preview is an admin representation. It is not intended to replace the design of the public portfolio.

## 15. Production checklist

Before releasing the dynamic portfolio:

- Confirm the backend deployment is running.
- Confirm MongoDB is connected.
- Add the public portfolio domain to `CORS_ORIGINS`.
- Add the API URL and Profile ID to the portfolio Vercel project.
- Confirm the public portfolio endpoint works in the browser.
- Confirm only published projects are returned.
- Confirm hidden skills are not returned.
- Confirm draft experience is not returned.
- Confirm draft education and certifications are not returned.
- Confirm hidden social links are empty.
- Test profile and project images.
- Test the resume link.
- Send one contact-form message.
- Confirm the message appears in the admin inbox.
- Test loading, error, and empty states.
- Test the portfolio on a mobile screen.
- Confirm there is no horizontal scrolling.
- Confirm all external links open safely in a new tab.
- Redeploy the portfolio after changing environment variables.

## Recommended implementation order

When work begins on the public portfolio repository, follow these phases:

### Phase 1 — Data connection

- Add environment variables.
- Add the API service.
- Fetch and inspect the portfolio payload.

### Phase 2 — Public sections

- Connect Profile and About.
- Connect Projects.
- Connect Skills.
- Connect Experience.
- Connect Education and Certifications.
- Connect Resume and social links.

### Phase 3 — Contact form

- Add validation.
- Submit to the public contact endpoint.
- Add loading, success, and error states.
- Confirm messages appear in the admin inbox.

### Phase 4 — Final cleanup

- Remove static data.
- Remove unused files and imports.
- Test responsive layouts.
- Test the production deployment.

Following this process keeps the current public design intact while replacing only its static content with managed Portfolio data.
