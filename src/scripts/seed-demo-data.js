import mongoose from 'mongoose';
import { pathToFileURL } from 'node:url';

import { connectDatabase } from '../config/database.js';
import { Business } from '../modules/businesses/business.model.js';
import { Conversation } from '../modules/conversations/conversation.model.js';
import { FollowUp } from '../modules/follow-ups/follow-up.model.js';
import { Opportunity } from '../modules/opportunities/opportunity.model.js';
import {
  createOpportunity,
  updateOpportunity,
} from '../modules/opportunities/opportunity.service.js';
import { Problem } from '../modules/problems/problem.model.js';

const dateFromToday = (days) => {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + days));
};

const demoRecords = [
  {
    business: {
      companyName: 'MetroMart Retail (Demo)',
      businessType: 'Retail store',
      industry: 'Retail',
      location: 'Mumbai, Maharashtra',
      contactPerson: 'Asha Mehta',
      contactNumber: '+91 90000 10001',
      email: 'asha@metromart.example',
      website: 'metromart.example',
      generalNotes: 'Busy neighborhood store with a growing product range.',
      dateVisitedOrResearched: dateFromToday(-1),
      status: 'Visited',
    },
    conversation: {
      conversationDate: dateFromToday(-1),
      personName: 'Asha Mehta',
      personRole: 'Owner',
      rawConversationNotes:
        'Stock is updated at closing time. Staff write sales on paper during busy hours.',
      importantObservations: 'Inventory information is often one day behind.',
      followUpNotes: 'Ask for a sample stock sheet and daily sales workflow.',
    },
    problem: {
      title: 'Stock updates are delayed',
      description: 'The team cannot see accurate stock levels during the day.',
      currentProcess: 'Sales are written on paper and entered into Excel at closing time.',
      frequency: 'Multiple times each day',
      painLevel: 9,
      timeImpact: 'About 3 staff hours every day',
      financialImpact: 'Missed sales when staff believe an item is unavailable',
      existingSoftware: 'Excel',
      willingnessToPay: 'Yes',
      notes: 'A simple mobile-first workflow may fit the team.',
      status: 'Validated',
      tags: ['Inventory', 'Excel', 'Manual Work', 'Stock Management'],
    },
    opportunity: {
      whyValuable: 'The problem happens daily and directly affects sales and customer service.',
      marketPotential: 'Small retailers that still update inventory manually.',
      difficulty: 'Medium',
      validationStatus: 'Validated',
      notes: 'Validate barcode scanning and offline use.',
      status: 'Active',
    },
  },
  {
    business: {
      companyName: 'CityCare Pharmacy (Demo)',
      businessType: 'Independent pharmacy',
      industry: 'Healthcare retail',
      location: 'Pune, Maharashtra',
      contactPerson: 'Rohan Kulkarni',
      contactNumber: '+91 90000 10002',
      email: 'rohan@citycare.example',
      website: 'citycare.example',
      generalNotes: 'Handles medicines from several distributors.',
      dateVisitedOrResearched: dateFromToday(-2),
      status: 'Contacted',
    },
    conversation: {
      conversationDate: dateFromToday(-2),
      personName: 'Rohan Kulkarni',
      personRole: 'Store Manager',
      rawConversationNotes:
        'The manager checks shelves and two spreadsheets before ordering medicines.',
      importantObservations: 'Expiry dates and stock counts are maintained separately.',
      followUpNotes: 'Review their reorder and expiry tracking sheets.',
    },
    problem: {
      title: 'Stock updates are delayed',
      description: 'Medicine stock and expiry information is not available in one place.',
      currentProcess: 'The manager checks shelves and updates separate spreadsheets.',
      frequency: 'Every day',
      painLevel: 8,
      timeImpact: 'About 2 hours daily',
      financialImpact: 'Expired items and emergency purchases increase costs',
      existingSoftware: 'Excel',
      willingnessToPay: 'Yes',
      notes: 'Expiry alerts are as important as stock counts.',
      status: 'In Review',
      tags: ['Inventory', 'Excel', 'Manual Work', 'Purchasing'],
    },
    opportunity: {
      whyValuable: 'Poor stock visibility creates waste and urgent purchasing costs.',
      marketPotential: 'Independent pharmacies with basic billing software.',
      difficulty: 'High',
      validationStatus: 'Researching',
      notes: 'Research medicine data and compliance requirements.',
      status: 'Active',
    },
  },
  {
    business: {
      companyName: 'GreenLeaf Distributors (Demo)',
      businessType: 'Wholesale distributor',
      industry: 'FMCG distribution',
      location: 'Ahmedabad, Gujarat',
      contactPerson: 'Neel Shah',
      contactNumber: '+91 90000 10003',
      email: 'neel@greenleaf.example',
      website: 'greenleaf.example',
      generalNotes: 'Supplies packaged goods to around 80 local stores.',
      dateVisitedOrResearched: dateFromToday(-4),
      status: 'Active',
    },
    conversation: {
      conversationDate: dateFromToday(-4),
      personName: 'Neel Shah',
      personRole: 'Operations Head',
      rawConversationNotes:
        'Orders arrive by phone and WhatsApp. Warehouse stock is checked manually.',
      importantObservations: 'Sales and warehouse teams use different stock numbers.',
      followUpNotes: 'Ask how often an accepted order cannot be fulfilled.',
    },
    problem: {
      title: 'Stock updates are delayed',
      description: 'Sales staff confirm orders without reliable warehouse stock information.',
      currentProcess: 'Warehouse staff share updated Excel files in a messaging group.',
      frequency: 'Multiple times each day',
      painLevel: 9,
      timeImpact: 'Around 4 hours of calls and corrections daily',
      financialImpact: 'Cancelled orders and extra delivery trips',
      existingSoftware: 'Excel and WhatsApp',
      willingnessToPay: 'Yes',
      notes: 'Role-based stock visibility may solve the immediate issue.',
      status: 'Validated',
      tags: ['Inventory', 'WhatsApp', 'Excel', 'Stock Management'],
    },
    opportunity: {
      whyValuable: 'The problem affects order accuracy, warehouse work, and delivery costs.',
      marketPotential: 'Regional distributors with field sales teams.',
      difficulty: 'Medium',
      validationStatus: 'Validated',
      notes: 'Test with sales and warehouse users separately.',
      status: 'Active',
    },
  },
  {
    business: {
      companyName: 'BrightBuild Hardware (Demo)',
      businessType: 'Hardware supplier',
      industry: 'Construction supplies',
      location: 'Surat, Gujarat',
      contactPerson: 'Imran Sheikh',
      contactNumber: '+91 90000 10004',
      email: 'imran@brightbuild.example',
      website: 'brightbuild.example',
      generalNotes: 'Creates custom quotations for contractors and builders.',
      dateVisitedOrResearched: dateFromToday(-6),
      status: 'Visited',
    },
    conversation: {
      conversationDate: dateFromToday(-6),
      personName: 'Imran Sheikh',
      personRole: 'Sales Manager',
      rawConversationNotes:
        'Product prices are copied from several supplier lists into quotation documents.',
      importantObservations: 'Customers often wait until the next day for a quotation.',
      followUpNotes: 'Collect two recent quotations and supplier price lists.',
    },
    problem: {
      title: 'Quotations take too long',
      description: 'Preparing a quotation requires repeated price checks and manual document work.',
      currentProcess: 'Sales staff check supplier PDFs, calculate prices, and type a document.',
      frequency: 'Every day',
      painLevel: 8,
      timeImpact: '30 to 45 minutes for each quotation',
      financialImpact: 'Slow replies reduce the chance of winning urgent orders',
      existingSoftware: 'Word, Excel, and WhatsApp',
      willingnessToPay: 'Yes',
      notes: 'Price updates and reusable product lists are essential.',
      status: 'Validated',
      tags: ['Quotation', 'WhatsApp', 'Excel', 'Manual Work'],
    },
    opportunity: {
      whyValuable: 'Faster quotations could improve response time and order conversion.',
      marketPotential: 'Hardware, building material, and industrial suppliers.',
      difficulty: 'Low',
      validationStatus: 'Researching',
      notes: 'Validate how supplier price changes should be handled.',
      status: 'Active',
    },
  },
  {
    business: {
      companyName: 'NovaPrint Studio (Demo)',
      businessType: 'Printing service',
      industry: 'Printing and design',
      location: 'Vadodara, Gujarat',
      contactPerson: 'Pooja Rao',
      contactNumber: '+91 90000 10005',
      email: 'pooja@novaprint.example',
      website: 'novaprint.example',
      generalNotes: 'Handles short-run commercial printing and design work.',
      dateVisitedOrResearched: dateFromToday(-9),
      status: 'Contacted',
    },
    conversation: {
      conversationDate: dateFromToday(-9),
      personName: 'Pooja Rao',
      personRole: 'Founder',
      rawConversationNotes:
        'Every print job has different size, paper, finishing, design, and delivery costs.',
      importantObservations: 'Only the founder can confidently prepare complex quotations.',
      followUpNotes: 'Understand their pricing rules for the five most common jobs.',
    },
    problem: {
      title: 'Quotations take too long',
      description: 'Complex pricing makes quotation work slow and dependent on the founder.',
      currentProcess: 'Old Excel quotations are copied and adjusted manually.',
      frequency: 'Every day',
      painLevel: 7,
      timeImpact: 'Around 2 hours daily',
      financialImpact: 'Some small enquiries are not answered',
      existingSoftware: 'Excel',
      willingnessToPay: 'Unknown',
      notes: 'A rules-based calculator could help staff quote common jobs.',
      status: 'In Review',
      tags: ['Quotation', 'Excel', 'Manual Work'],
    },
    opportunity: {
      whyValuable: 'The workflow limits sales capacity and depends on one person.',
      marketPotential: 'Small printing and custom manufacturing businesses.',
      difficulty: 'Medium',
      validationStatus: 'Not Validated',
      notes: 'Speak with two more printing businesses.',
      status: 'Active',
    },
  },
  {
    business: {
      companyName: 'FreshRoute Foods (Demo)',
      businessType: 'Food distributor',
      industry: 'Food distribution',
      location: 'Rajkot, Gujarat',
      contactPerson: 'Karan Patel',
      contactNumber: '+91 90000 10006',
      email: 'karan@freshroute.example',
      website: 'freshroute.example',
      generalNotes: 'Runs daily delivery routes for restaurants and small stores.',
      dateVisitedOrResearched: dateFromToday(-12),
      status: 'Prospect',
    },
    conversation: {
      conversationDate: dateFromToday(-12),
      personName: 'Karan Patel',
      personRole: 'Dispatch Manager',
      rawConversationNotes:
        'Customers call the office for delivery updates. Drivers share locations by phone.',
      importantObservations: 'The office cannot quickly answer delivery questions.',
      followUpNotes: 'Ask drivers how they receive route changes.',
    },
    problem: {
      title: 'Delivery updates are hard to track',
      description: 'The office and customers do not have a clear view of delivery progress.',
      currentProcess: 'Dispatch staff call drivers and send updates through WhatsApp.',
      frequency: 'Multiple times each day',
      painLevel: 8,
      timeImpact: 'Around 3 hours of calls daily',
      financialImpact: 'Late delivery complaints and repeat trips',
      existingSoftware: 'WhatsApp',
      willingnessToPay: 'Unknown',
      notes: 'A lightweight driver update flow may be enough.',
      status: 'Open',
      tags: ['Delivery', 'WhatsApp', 'Follow-up'],
    },
  },
  {
    business: {
      companyName: 'Axis Auto Parts (Demo)',
      businessType: 'Parts manufacturer',
      industry: 'Automotive manufacturing',
      location: 'Nashik, Maharashtra',
      contactPerson: 'Meera Joshi',
      contactNumber: '+91 90000 10007',
      email: 'meera@axisparts.example',
      website: 'axisparts.example',
      generalNotes: 'Purchases raw material from approved regional suppliers.',
      dateVisitedOrResearched: dateFromToday(-15),
      status: 'Contacted',
    },
    conversation: {
      conversationDate: dateFromToday(-15),
      personName: 'Meera Joshi',
      personRole: 'Purchase Manager',
      rawConversationNotes:
        'Purchase requests are printed, signed, scanned, and emailed to suppliers.',
      importantObservations: 'Urgent approvals stop when a manager is away.',
      followUpNotes: 'Map approval limits and exception rules.',
    },
    problem: {
      title: 'Purchase approvals are manual',
      description: 'Paper approvals delay purchasing and make request status difficult to track.',
      currentProcess: 'A printed request moves between operations, finance, and management.',
      frequency: 'Every week',
      painLevel: 7,
      timeImpact: 'One to two days of waiting per request',
      financialImpact: 'Production can wait for urgent materials',
      existingSoftware: 'Email and paper forms',
      willingnessToPay: 'Yes',
      notes: 'Mobile approvals and a clear audit trail are important.',
      status: 'Open',
      tags: ['Purchasing', 'Manual Work', 'Follow-up'],
    },
  },
  {
    business: {
      companyName: 'UrbanSpace Interiors (Demo)',
      businessType: 'Interior design studio',
      industry: 'Interior design',
      location: 'Indore, Madhya Pradesh',
      contactPerson: 'Sana Khan',
      contactNumber: '+91 90000 10008',
      email: 'sana@urbanspace.example',
      website: 'urbanspace.example',
      generalNotes: 'Small design team managing residential projects.',
      dateVisitedOrResearched: dateFromToday(-18),
      status: 'Prospect',
    },
    conversation: {
      conversationDate: dateFromToday(-18),
      personName: 'Sana Khan',
      personRole: 'Principal Designer',
      rawConversationNotes:
        'Enquiries and project decisions are spread across personal WhatsApp chats.',
      importantObservations:
        'Potential customers are sometimes not contacted after the first discussion.',
      followUpNotes: 'Review how enquiries move from first call to proposal.',
    },
    problem: {
      title: 'Customer follow-ups are missed',
      description: 'The team does not have one clear list of enquiries and promised follow-ups.',
      currentProcess: 'Each designer keeps messages and reminders on their own phone.',
      frequency: 'Every week',
      painLevel: 6,
      timeImpact: 'Several hours each week checking old chats',
      financialImpact: 'Warm leads may be lost',
      existingSoftware: 'WhatsApp',
      willingnessToPay: 'Unknown',
      notes: 'The solution must be faster than updating a full CRM.',
      status: 'Open',
      tags: ['WhatsApp', 'Follow-up', 'Manual Work'],
    },
  },
];

const followUpDefinitions = [
  {
    record: 0,
    days: 2,
    reason: 'Review the sample stock sheet',
    notes: 'Confirm which fields staff update during closing.',
    status: 'Pending',
    useOpportunity: true,
  },
  {
    record: 1,
    days: -3,
    reason: 'Discuss expiry tracking',
    notes: 'Ask how expired stock is currently reported.',
    status: 'Pending',
  },
  {
    record: 2,
    days: 5,
    reason: 'Validate warehouse workflow',
    notes: 'Speak with one warehouse user and one sales user.',
    status: 'Pending',
    useOpportunity: true,
  },
  {
    record: 3,
    days: -1,
    reason: 'Collect recent quotations',
    notes: 'Two quotations were received and reviewed.',
    status: 'Completed',
    useOpportunity: true,
  },
  {
    record: 4,
    days: 10,
    reason: 'Test common print pricing rules',
    notes: 'Prepare a simple quotation example.',
    status: 'Cancelled',
    useOpportunity: true,
  },
  {
    record: 5,
    days: -1,
    reason: 'Interview two delivery drivers',
    notes: 'Learn how drivers report delays and route changes.',
    status: 'Pending',
  },
  {
    record: 7,
    days: 7,
    reason: 'Map the enquiry follow-up process',
    notes: 'List each step from first call to proposal.',
    status: 'Pending',
  },
];

export const upsertDemoData = async () => {
  const savedRecords = [];

  for (const record of demoRecords) {
    let business = await Business.findOne({ companyName: record.business.companyName });

    if (business) {
      Object.assign(business, record.business);
      await business.save();
    } else {
      business = await Business.create(record.business);
    }

    let conversation = await Conversation.findOne({
      business: business._id,
      personName: record.conversation.personName,
    });

    if (conversation) {
      Object.assign(conversation, record.conversation);
      await conversation.save();
    } else {
      conversation = await Conversation.create({
        ...record.conversation,
        business: business._id,
      });
    }

    let problem = await Problem.findOne({ business: business._id, title: record.problem.title });

    if (problem) {
      Object.assign(problem, record.problem, { conversation: conversation._id });
      await problem.save();
    } else {
      problem = await Problem.create({
        ...record.problem,
        business: business._id,
        conversation: conversation._id,
      });
    }

    savedRecords.push({ business, conversation, problem, opportunity: null });
  }

  for (const [index, record] of demoRecords.entries()) {
    if (!record.opportunity) continue;

    const saved = savedRecords[index];
    const existingOpportunity = await Opportunity.findOne({ problem: saved.problem._id });

    saved.opportunity = existingOpportunity
      ? await updateOpportunity(existingOpportunity._id, record.opportunity)
      : await createOpportunity({ ...record.opportunity, problem: saved.problem._id });
  }

  for (const definition of followUpDefinitions) {
    const saved = savedRecords[definition.record];
    const data = {
      business: saved.business._id,
      conversation: saved.conversation._id,
      opportunity: definition.useOpportunity ? saved.opportunity?._id || null : null,
      followUpDate: dateFromToday(definition.days),
      reason: definition.reason,
      notes: definition.notes,
      status: definition.status,
      completedAt: definition.status === 'Completed' ? dateFromToday(-1) : null,
    };

    await FollowUp.findOneAndUpdate(
      { business: saved.business._id, reason: definition.reason },
      data,
      { upsert: true, returnDocument: 'after', runValidators: true, setDefaultsOnInsert: true },
    );
  }

  return {
    businesses: savedRecords.length,
    conversations: savedRecords.length,
    problems: savedRecords.length,
    opportunities: savedRecords.filter((record) => record.opportunity).length,
    followUps: followUpDefinitions.length,
  };
};

const isRunDirectly = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isRunDirectly) {
  try {
    await connectDatabase();
    const counts = await upsertDemoData();
    console.log('Demo data is ready:', counts);
  } catch (error) {
    console.error(`Unable to seed demo data: ${error.message}`);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}
