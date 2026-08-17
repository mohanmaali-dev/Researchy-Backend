import { Business } from '../businesses/business.model.js';
import { Contact } from '../contacts/contact.model.js';

const dateFromToday = (days) => {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + days));
};

const demoContacts = [
  {
    fullName: 'Asha Mehta (Demo)',
    phoneNumber: '919000010001',
    email: 'asha.contact@demo.example',
    companyName: 'MetroMart Retail (Demo)',
    role: 'Owner',
    contactType: 'Business Owner',
    location: 'Mumbai, Maharashtra',
    notes: 'Interested in improving daily inventory updates.',
    lastContactedDate: dateFromToday(-1),
    nextFollowUpDate: dateFromToday(6),
    status: 'Active',
  },
  {
    fullName: 'Rohan Kulkarni (Demo)',
    phoneNumber: '919000010002',
    email: 'rohan.contact@demo.example',
    companyName: 'CityCare Pharmacy (Demo)',
    role: 'Store Manager',
    contactType: 'Potential Customer',
    location: 'Pune, Maharashtra',
    notes: 'Discuss expiry and reorder tracking.',
    lastContactedDate: dateFromToday(-2),
    nextFollowUpDate: dateFromToday(4),
    status: 'Active',
  },
  {
    fullName: 'Neel Shah (Demo)',
    phoneNumber: '919000010003',
    email: 'neel.contact@demo.example',
    companyName: 'GreenLeaf Distributors (Demo)',
    role: 'Operations Head',
    contactType: 'Customer',
    location: 'Ahmedabad, Gujarat',
    notes: 'Main contact for warehouse workflow validation.',
    lastContactedDate: dateFromToday(-4),
    nextFollowUpDate: dateFromToday(5),
    status: 'Active',
  },
  {
    fullName: 'Imran Sheikh (Demo)',
    phoneNumber: '919000010004',
    email: 'imran.contact@demo.example',
    companyName: 'BrightBuild Hardware (Demo)',
    role: 'Sales Manager',
    contactType: 'Supplier',
    location: 'Surat, Gujarat',
    notes: 'Can share recent quotation examples.',
    lastContactedDate: dateFromToday(-6),
    nextFollowUpDate: dateFromToday(2),
    status: 'Active',
  },
  {
    fullName: 'Pooja Rao (Demo)',
    phoneNumber: '919000010005',
    email: 'pooja.contact@demo.example',
    companyName: 'NovaPrint Studio (Demo)',
    role: 'Founder',
    contactType: 'Professional',
    location: 'Vadodara, Gujarat',
    notes: 'Researching quotation rules for printing jobs.',
    lastContactedDate: dateFromToday(-9),
    nextFollowUpDate: dateFromToday(8),
    status: 'Active',
  },
  {
    fullName: 'Karan Patel (Demo)',
    phoneNumber: '919000010006',
    email: 'karan.contact@demo.example',
    companyName: 'FreshRoute Foods (Demo)',
    role: 'Dispatch Manager',
    contactType: 'Business Owner',
    location: 'Rajkot, Gujarat',
    notes: 'Follow up about delivery status updates.',
    lastContactedDate: dateFromToday(-12),
    nextFollowUpDate: dateFromToday(3),
    status: 'Active',
  },
  {
    fullName: 'Meera Joshi (Demo)',
    phoneNumber: '919000010007',
    email: 'meera.contact@demo.example',
    companyName: 'Axis Auto Parts (Demo)',
    role: 'Purchase Manager',
    contactType: 'Professional',
    location: 'Nashik, Maharashtra',
    notes: 'Understands the current purchase approval process.',
    lastContactedDate: dateFromToday(-15),
    nextFollowUpDate: null,
    status: 'Inactive',
  },
  {
    fullName: 'Sana Khan (Demo)',
    phoneNumber: '919000010008',
    email: 'sana.contact@demo.example',
    companyName: 'UrbanSpace Interiors (Demo)',
    role: 'Principal Designer',
    contactType: 'Other',
    location: 'Indore, Madhya Pradesh',
    notes: 'Potential contact for enquiry follow-up research.',
    lastContactedDate: dateFromToday(-18),
    nextFollowUpDate: dateFromToday(7),
    status: 'Active',
  },
];

export const upsertDemoContacts = async () => {
  for (const definition of demoContacts) {
    const business = await Business.findOne({ companyName: definition.companyName }).select('_id');

    await Contact.findOneAndUpdate(
      { email: definition.email },
      { ...definition, business: business?._id || null },
      { upsert: true, returnDocument: 'after', runValidators: true, setDefaultsOnInsert: true },
    );
  }

  return { contacts: demoContacts.length };
};
