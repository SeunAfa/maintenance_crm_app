import {
  ISSUE_CATEGORIES,
  PRIORITIES,
  CASE_STATUSES,
  REQUEST_TYPES,
  SOURCE_TYPES,
  REQUESTER,
  CAMPUSES,
  CAMPUS_BUILDINGS,
  BLOCKS,
  FLOORS,
  FLATS,
  ROOMS,
  SITES,
  CONTRACT_TYPES,
} from "../utils/constants";
import { CURRENT_AGENT } from "./usersData";
import { SUB_CATEGORIES_ISSUE } from "../data/subCategoriesIssues";

const REQUESTER_2 = {
  displayName: "James Okafor",
  email: "james.okafor@greenwich.ac.uk",
  clientEmployee: false,
  isStudent: true,
  requesterExist: true,
  site: SITES[0],
  contractType: CONTRACT_TYPES[0],
};

// ─── Seeded converted cases (for duplicate detection testing) ──────────────────
const REQUESTER_3 = {
  displayName: "Sophie Patel",
  firstName: "Sophie",
  lastName: "Patel",
  email: "s.patel@greenwich.ac.uk",
  clientEmployee: false,
  isStudent: true,
  requesterExist: true,
  site: SITES[0],
  contractType: CONTRACT_TYPES[0],
};

const REQUESTER_4 = {
  displayName: "Marcus Adeyemi",
  firstName: "Marcus",
  lastName: "Adeyemi",
  email: "m.adeyemi@greenwich.ac.uk",
  clientEmployee: false,
  isStudent: true,
  requesterExist: true,
  site: SITES[0],
  contractType: CONTRACT_TYPES[0],
};

const REQUESTER_5 = {
  displayName: "Fatima Al-Rashid",
  firstName: "Fatima",
  lastName: "Al-Rashid",
  email: "f.alrashid@greenwich.ac.uk",
  clientEmployee: false,
  isStudent: true,
  requesterExist: true,
  site: SITES[0],
  contractType: CONTRACT_TYPES[0],
};

export const INITIAL_CASES = [
  {
    id: 1,
    caseId: "CASE-001",
    title: "Leaking tap in kitchen",
    description: "The kitchen tap has been dripping for 2 days. Water is pooling under the sink and causing damage to the cabinet below.",
    category: ISSUE_CATEGORIES[1],
    ServiceCategory: SUB_CATEGORIES_ISSUE[1].issues[2],
    priority: PRIORITIES[1],
    case_status: CASE_STATUSES[0],
    requestTypes: REQUEST_TYPES[0],
    source: SOURCE_TYPES[0],
    sharedIssue: true,
    location: {
      campus: REQUESTER.campus,
      building: REQUESTER.building,
      block: REQUESTER.block,
      floor: REQUESTER.floor,
      flat: REQUESTER.flat,
      room: REQUESTER.room,
    },
    affectedRequester: REQUESTER,
    requester: {
      displayName: REQUESTER.displayName,
      email: REQUESTER.email,
      clientEmployee: REQUESTER.clientEmployee,
      role: REQUESTER.userRoles,
      requesterExist: REQUESTER.requesterExist,
      site: REQUESTER.site,
      contractType: REQUESTER.contractType,
      isStudent: REQUESTER.isStudent,
    },
    messages: [
      {
        from: "tenant",
        subject: "Leaking tap in kitchen — urgent",
        text: "Hi,\n\nThe kitchen tap in my flat has been constantly dripping since Tuesday. There is now water pooling under the sink and it is starting to damage the cabinet below.\n\nCould someone please come and fix this as soon as possible?\n\nThank you,\nAmara Osei",
        time: "09:42",
        attachments: [{ name: "kitchen_tap_photo.jpg", size: "1.4 MB" }],
      },
      {
        from: "agent",
        subject: "Your request CASE-001 — received",
        text: "Dear Amara,\n\nThank you for getting in touch with us. We are currently reviewing your case (CASE-001) to arrange for the work to be carried out.\n\nYou can follow live progress here: https://track.facility.app/track-case/CASE-001\n\nPlease quote your case reference in any future correspondence.\n\nCase: CASE-001\n\nKind regards,\nFacility Support Team",
        time: "10:05",
        auto: true,
      },
    ],
    createdAt: new Date().toISOString(),
    createdBy: CURRENT_AGENT,
    woNotes: [
      { id: 1001, text: "Thanks Amara — we've flagged this as a priority because of the water damage. We'll have an engineer scheduled within the next 24 hours.", internal: false, author: "Jordan Smith", authorRole: "Helpdesk", time: "10:22" },
    ],
  },
  {
    id: 2,
    caseId: "CASE-002",
    title: "Broken window in living room",
    description: "The living room window is cracked and needs replacement. There is a draught coming through and it is a security concern.",
    category: ISSUE_CATEGORIES[0],
    ServiceCategory: SUB_CATEGORIES_ISSUE[3].issues[1],
    priority: PRIORITIES[2],
    case_status: CASE_STATUSES[1],
    requestTypes: REQUEST_TYPES[0],
    source: SOURCE_TYPES[0],
    sharedIssue: false,
    location: {
      campus: REQUESTER.campus,
      building: REQUESTER.building,
      block: REQUESTER.block,
      floor: REQUESTER.floor,
      flat: REQUESTER.flat,
      room: REQUESTER.room,
    },
    affectedRequester: REQUESTER_2,
    requester: {
      displayName: REQUESTER_2.displayName,
      email: REQUESTER_2.email,
      clientEmployee: REQUESTER_2.clientEmployee,
      requesterExist: REQUESTER_2.requesterExist,
      site: REQUESTER_2.site,
      contractType: REQUESTER_2.contractType,
      isStudent: REQUESTER_2.isStudent,
    },
    messages: [
      {
        from: "tenant",
        subject: "Cracked window — living room",
        text: "Hello,\n\nI noticed this morning that the living room window has a large crack running across it. There is a draught coming through and I am worried about security.\n\nPlease could this be looked at urgently?\n\nThanks,\nJames Okafor",
        time: "08:15",
        attachments: [
          { name: "window_crack.jpg", size: "2.1 MB" },
          { name: "window_overview.jpg", size: "1.8 MB" },
        ],
      },
      {
        from: "agent",
        subject: "Your request CASE-002 — received",
        text: "Dear James,\n\nThank you for getting in touch with us. We are currently reviewing your case (CASE-002) to arrange for the work to be carried out.\n\nYou can follow live progress here: https://track.facility.app/track-case/CASE-002\n\nPlease quote your case reference in any future correspondence.\n\nCase: CASE-002\n\nKind regards,\nFacility Support Team",
        time: "09:00",
        auto: true,
      },
    ],
    createdAt: new Date().toISOString(),
    createdBy: CURRENT_AGENT,
    woNotes: [
      { id: 1002, text: "Hi James — duly noted. While we get an engineer assigned, please avoid opening the window further to keep the crack from spreading.", internal: false, author: "Jordan Smith", authorRole: "Helpdesk", time: "09:30" },
    ],
  },

  // ── CASE-003: Converted · SAME exact location · same plumbing issue ──────────
  // Expected: HIGH duplicate match for CASE-001 (same building/block/flat/room + similar description)
  {
    id: 3,
    caseId: "CASE-003",
    title: "Dripping tap causing water damage under sink",
    description:
      "Tenant reported a constantly dripping kitchen tap causing water to pool under the sink. The pooling water has begun to damage the cabinet below and the issue has been ongoing for several days. Immediate repair required to prevent further damage.",
    category: ISSUE_CATEGORIES[1],
    ServiceCategory: SUB_CATEGORIES_ISSUE[2].issues[2], // Plumbing → Leaking tap or fixture (PL-003)
    priority: PRIORITIES[1], // Medium
    case_status: "Converted",
    requestTypes: REQUEST_TYPES[0], // Service Request
    source: SOURCE_TYPES[0], // Email
    sharedIssue: true,
    workOrderNumber: "WO-2001",
    workOrderStatus: "Awaiting Parts",
    workOrderCreatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    dispatchedAt:    new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    acknowledgedAt:  new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    inProgressAt:    new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    respondedAt:     new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    awaitingPartsAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 + 60_000).toISOString(),
    partsExpectedIn: "1-2weeks",
    scheduledDate:   new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    scheduledTime:   "09:10",
    estimatedDuration: "2 hours",
    assignedTo:        "David Osei",
    assignedToId:      101,
    assignedEngineers: [
      { id: 101, displayName: "David Osei",  workerRole: "Maintenance Engineer", isLead: true  },
    ],
    location: {
      campus: REQUESTER.campus,    // North Campus
      building: REQUESTER.building, // Rutherford Hall
      block: REQUESTER.block,       // A
      floor: REQUESTER.floor,       // Ground Floor
      flat: REQUESTER.flat,         // Flat 1
      room: REQUESTER.room,         // Kitchen
    },
    affectedRequester: REQUESTER_3,
    requester: {
      displayName: REQUESTER_3.displayName,
      email: REQUESTER_3.email,
      clientEmployee: REQUESTER_3.clientEmployee,
      isStudent: REQUESTER_3.isStudent,
      requesterExist: REQUESTER_3.requesterExist,
      site: REQUESTER_3.site,
      contractType: REQUESTER_3.contractType,
    },
    messages: [
      {
        from: "tenant",
        subject: "Dripping tap — water damage",
        text: "Hi,\n\nThe kitchen tap in my flat has been dripping constantly for the past few days. Water is now pooling under the sink and I can see it is starting to damage the cabinet below.\n\nPlease can this be fixed as soon as possible?\n\nThank you,\nSophie Patel",
        time: "11:20",
      },
      {
        from: "agent",
        subject: "Your request CASE-003 — received",
        text: "Dear Sophie,\n\nThank you for getting in touch with us. We are currently reviewing your case (CASE-003) to arrange for the work to be carried out.\n\nYou can follow live progress here: https://track.facility.app/track-case/CASE-003\n\nPlease quote your case reference in any future correspondence.\n\nCase: CASE-003\n\nKind regards,\nFacility Support Team",
        time: "11:22",
        auto: true,
      },
      {
        from: "agent",
        subject: "Your request CASE-003 — work scheduled",
        text: "Dear Sophie,\n\nThank you for getting in touch with us. We have reviewed your case (CASE-003) and arranged for the work to be carried out.\n\nYou can follow live progress here: https://track.facility.app/track-case/CASE-003\n\nPlease quote your case reference in any future correspondence.\n\nCase: CASE-003\n\nKind regards,\nFacility Support Team",
        time: "11:45",
      },
      {
        from: "agent",
        subject: "Update on CASE-003 — Engineer Assigned",
        text: "Dear Sophie,\n\nAn engineer has been assigned to Dripping tap causing water damage under sink. David Osei will be carrying out the work.\n\nYou can follow live progress here: https://track.facility.app/track-case/CASE-003\n\nCase: CASE-003\n\nKind regards,\nFacility Support Team",
        time: "08:45",
      },
      {
        from: "agent",
        subject: "Update on CASE-003 — Work Has Begun",
        text: "Dear Sophie,\n\nWe wanted to let you know that work has now started on Dripping tap causing water damage under sink.\n\nYour assigned engineer is David Osei. We will update you once the work is complete.\n\nYou can follow live progress here: https://track.facility.app/track-case/CASE-003\n\nCase: CASE-003\n\nKind regards,\nMaintenance Team",
        time: "09:10",
      },
      {
        from: "agent",
        subject: "Update on CASE-003 — Awaiting Parts",
        text: "Dear Sophie,\n\nWe're working on Dripping tap causing water damage under sink, but we need to order in parts before David Osei can complete the repair.\n\nBased on our supplier's lead time we expect the parts within the next 1–2 weeks, and your resolve SLA has been extended accordingly.\n\nWe'll be in touch as soon as the parts arrive and work resumes.\n\nYou can follow live progress here: https://track.facility.app/track-case/CASE-003\n\nCase: CASE-003\n\nKind regards,\nMaintenance Team",
        time: "10:35",
      },
    ],
    createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    createdBy: CURRENT_AGENT,
    woNotes: [
      { id: 501, text: "Parts ordered — awaiting delivery before engineer can proceed.", internal: true, author: "David Osei", authorRole: "Maintenance Engineer", time: "10:30" },
      { id: 502, text: "Hi Sophie — the replacement tap cartridge is being shipped to us, expected within 1–2 weeks. We'll be back in touch as soon as it arrives to book your visit.", internal: false, author: "David Osei", authorRole: "Maintenance Engineer", time: "10:35" },
    ],
    woLog: [
      { id: 101, text: "Work order WO-2001 dispatched to maintenance team",          author: CURRENT_AGENT, time: "11:50", date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),                           dotColor: "bg-electricBlue" },
      { id: 102, text: "Status changed to Acknowledged",                             author: "David Osei",  time: "08:45", date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),                           dotColor: "bg-purple-400"  },
      { id: 103, text: "Status changed to In Progress",                              author: "David Osei",  time: "09:10", date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),                           dotColor: "bg-amber-400"   },
      { id: 104, text: "Status changed to Responded",                                author: "David Osei",  time: "14:55", date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),                           dotColor: "bg-teal-400"    },
      { id: 105, text: "Internal note added",                                        author: "David Osei",  time: "10:30", date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),                           dotColor: "bg-amber-400",  noteText: "Parts ordered — awaiting delivery before engineer can proceed." },
      { id: 106, text: "Status automatically changed to Awaiting Parts — SLA extended by 72 h", author: "System (Auto-detect)", time: "10:31", date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 + 60_000).toISOString(), dotColor: "bg-orange-500"  },
    ],
  },

  // ── CASE-004: Converted · SAME building & block · different flat / floor ─────
  // Expected: MEDIUM duplicate match for CASE-001 (same building, same thermostat/HVAC category)
  {
    id: 4,
    caseId: "CASE-004",
    title: "Heating not working — thermostat unresponsive",
    description:
      "No heating in the flat. The thermostat does not respond when adjusted and the radiators remain cold. Multiple residents are affected and the flat is very cold. Urgent repair needed before temperatures drop further.",
    category: ISSUE_CATEGORIES[0],
    ServiceCategory: SUB_CATEGORIES_ISSUE[1].issues[2], // HVAC → Thermostat malfunction (HV-003)
    priority: PRIORITIES[3], // Urgent
    case_status: "Converted",
    requestTypes: REQUEST_TYPES[0], // Service Request
    source: SOURCE_TYPES[2], // WhatsApp
    sharedIssue: false,
    workOrderNumber: "WO-2002",
    workOrderStatus: "Completed",
    workOrderCreatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    dispatchedAt:    new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    acknowledgedAt:  new Date(Date.now() -  9 * 24 * 60 * 60 * 1000).toISOString(),
    inProgressAt:    new Date(Date.now() -  8 * 24 * 60 * 60 * 1000).toISOString(),
    respondedAt:     new Date(Date.now() -  7 * 24 * 60 * 60 * 1000).toISOString(),
    completedAt:     new Date(Date.now() -  6 * 24 * 60 * 60 * 1000).toISOString(),
    scheduledDate:   new Date(Date.now() -  8 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    scheduledTime:   "11:30",
    estimatedDuration: "3 hours",
    assignedTo:        "Sarah Mills",
    assignedToId:      102,
    assignedEngineers: [
      { id: 102, displayName: "Sarah Mills", workerRole: "Maintenance Engineer", isLead: true  },
      { id: 107, displayName: "James Knight", workerRole: "Maintenance Engineer", isLead: false },
    ],
    location: {
      campus: REQUESTER.campus,      // North Campus
      building: REQUESTER.building,  // Rutherford Hall
      block: REQUESTER.block,        // A
      floor: FLOORS[1],              // First Floor  ← different flat/floor
      flat: FLATS[2],                // Flat 3
      room: ROOMS[0],                // Kitchen
    },
    affectedRequester: REQUESTER_4,
    requester: {
      displayName: REQUESTER_4.displayName,
      email: REQUESTER_4.email,
      clientEmployee: REQUESTER_4.clientEmployee,
      isStudent: REQUESTER_4.isStudent,
      requesterExist: REQUESTER_4.requesterExist,
      site: REQUESTER_4.site,
      contractType: REQUESTER_4.contractType,
    },
    messages: [
      {
        from: "tenant",
        subject: "No heating — thermostat broken",
        text: "Hello,\n\nOur flat has had no heating for two days now. The thermostat does not respond at all and all the radiators are stone cold. There are four of us in the flat and it is becoming unbearable.\n\nPlease treat this as urgent.\n\nMany thanks,\nMarcus Adeyemi",
        time: "07:55",
      },
      {
        from: "agent",
        subject: "Your request CASE-004 — received",
        text: "Dear Marcus,\n\nThank you for getting in touch with us. We are currently reviewing your case (CASE-004) to arrange for the work to be carried out.\n\nYou can follow live progress here: https://track.facility.app/track-case/CASE-004\n\nPlease quote your case reference in any future correspondence.\n\nCase: CASE-004\n\nKind regards,\nFacility Support Team",
        time: "07:57",
        auto: true,
      },
      {
        from: "agent",
        subject: "Your request CASE-004 — work scheduled",
        text: "Dear Marcus,\n\nThank you for getting in touch with us. We have reviewed your case (CASE-004) and arranged for the work to be carried out.\n\nYou can follow live progress here: https://track.facility.app/track-case/CASE-004\n\nPlease quote your case reference in any future correspondence.\n\nCase: CASE-004\n\nKind regards,\nFacility Support Team",
        time: "08:30",
      },
      {
        from: "agent",
        subject: "Update on CASE-004 — Engineer Assigned",
        text: "Dear Marcus,\n\nAn engineer has been assigned to Heating not working — thermostat unresponsive. Sarah Mills will be carrying out the work.\n\nYou can follow live progress here: https://track.facility.app/track-case/CASE-004\n\nCase: CASE-004\n\nKind regards,\nFacility Support Team",
        time: "10:00",
      },
      {
        from: "agent",
        subject: "Update on CASE-004 — Work Has Begun",
        text: "Dear Marcus,\n\nWe wanted to let you know that work has now started on Heating not working — thermostat unresponsive.\n\nYour assigned engineer is Sarah Mills. We will update you once the work is complete.\n\nYou can follow live progress here: https://track.facility.app/track-case/CASE-004\n\nCase: CASE-004\n\nKind regards,\nMaintenance Team",
        time: "11:30",
      },
      {
        from: "agent",
        subject: "Update on CASE-004 — Completed",
        text: "Dear Marcus,\n\nWe are pleased to confirm that the work for Heating not working — thermostat unresponsive has been completed.\n\nYou can follow live progress here: https://track.facility.app/track-case/CASE-004\n\nIf you experience any further issues, please do not hesitate to contact us.\n\nCase: CASE-004\n\nKind regards,\nFacility Support Team",
        time: "16:20",
      },
    ],
    createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    createdBy: CURRENT_AGENT,
    woNotes: [
      { id: 1041, text: "Hi Marcus — Sarah will be with you tomorrow at 11:30. She'll bring a replacement thermostat just in case.", internal: false, author: "Jordan Smith", authorRole: "Helpdesk", time: "10:05" },
      { id: 1042, text: "On site now — confirmed the thermostat is the issue. Swapping it out, heating should be back within the hour.", internal: false, author: "Sarah Mills", authorRole: "Maintenance Engineer", time: "11:38" },
      { id: 1043, text: "New thermostat fitted and tested — all radiators are warming up nicely. Let us know if anything cools off again.", internal: false, author: "Sarah Mills", authorRole: "Maintenance Engineer", time: "13:20" },
    ],
    woLog: [
      { id: 201, text: "Work order WO-2002 dispatched to maintenance team", author: CURRENT_AGENT, time: "08:35", date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), dotColor: "bg-electricBlue" },
      { id: 202, text: "Status changed to Acknowledged", author: CURRENT_AGENT, time: "10:00", date: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(), dotColor: "bg-purple-400" },
      { id: 203, text: "Status changed to In Progress", author: CURRENT_AGENT, time: "11:30", date: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(), dotColor: "bg-amber-400" },
      { id: 204, text: "Internal note added", author: CURRENT_AGENT, time: "13:15", date: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(), dotColor: "bg-amber-400", noteText: "Engineer on site. Thermostat replacement underway." },
      { id: 205, text: "Status changed to Responded", author: CURRENT_AGENT, time: "14:45", date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), dotColor: "bg-teal-400" },
      { id: 206, text: "Reply sent to requester", author: CURRENT_AGENT, time: "14:50", date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), dotColor: "bg-electricBlue" },
      { id: 207, text: "Status changed to Completed", author: CURRENT_AGENT, time: "16:20", date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(), dotColor: "bg-emerald-400" },
    ],
  },

  // ── CASE-005: Converted · DIFFERENT building (Maxwell Hall) · same structural issue ──
  // Expected: cross-building match for CASE-002 (same window/structural category, different location)
  {
    id: 5,
    caseId: "CASE-005",
    title: "Cracked bedroom window — draught and security concern",
    description:
      "Window in the student bedroom has a visible crack running across the pane. A significant draught is coming through the gap and the crack is widening. The damaged window is a security risk and residents are concerned about safety.",
    category: ISSUE_CATEGORIES[3],
    ServiceCategory: SUB_CATEGORIES_ISSUE[3].issues[1], // Structural → Door/window not closing (ST-002)
    priority: PRIORITIES[2], // High
    case_status: "Converted",
    requestTypes: REQUEST_TYPES[0], // Service Request
    source: SOURCE_TYPES[3], // Web Portal
    sharedIssue: false,
    workOrderNumber: "WO-2003",
    workOrderStatus: "Dispatched",
    workOrderCreatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    dispatchedAt:      new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    location: {
      campus: CAMPUSES[0],                      // North Campus  ← same campus, different building
      building: CAMPUS_BUILDINGS[0].building[1], // Maxwell Hall
      block: BLOCKS[1],                          // B
      floor: FLOORS[2],                          // Second Floor
      flat: FLATS[4],                            // Flat 5
      room: ROOMS[3],                            // Room 1
    },
    affectedRequester: REQUESTER_5,
    requester: {
      displayName: REQUESTER_5.displayName,
      email: REQUESTER_5.email,
      clientEmployee: REQUESTER_5.clientEmployee,
      isStudent: REQUESTER_5.isStudent,
      requesterExist: REQUESTER_5.requesterExist,
      site: REQUESTER_5.site,
      contractType: REQUESTER_5.contractType,
    },
    messages: [
      {
        from: "tenant",
        subject: "Cracked window in my room",
        text: "Hi,\n\nI noticed yesterday that the window in my bedroom has a crack running across it. There is a draught coming in and the crack seems to be getting bigger. I am worried this is a security issue as the window no longer feels secure.\n\nCould someone please come and assess it?\n\nThanks,\nFatima Al-Rashid",
        time: "14:10",
      },
      {
        from: "agent",
        subject: "Your request CASE-005 — received",
        text: "Dear Fatima,\n\nThank you for getting in touch with us. We are currently reviewing your case (CASE-005) to arrange for the work to be carried out.\n\nYou can follow live progress here: https://track.facility.app/track-case/CASE-005\n\nPlease quote your case reference in any future correspondence.\n\nCase: CASE-005\n\nKind regards,\nFacility Support Team",
        time: "14:12",
        auto: true,
      },
      {
        from: "agent",
        subject: "Your request CASE-005 — work scheduled",
        text: "Dear Fatima,\n\nThank you for getting in touch with us. We have reviewed your case (CASE-005) and arranged for the work to be carried out.\n\nYou can follow live progress here: https://track.facility.app/track-case/CASE-005\n\nPlease quote your case reference in any future correspondence.\n\nCase: CASE-005\n\nKind regards,\nFacility Support Team",
        time: "14:35",
      },
    ],
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    createdBy: CURRENT_AGENT,
    woNotes: [
      { id: 1051, text: "Treating this as high priority because of the security risk. We're sourcing glass that matches the existing pane today and will book a visit within 48 hours.", internal: false, author: "Jordan Smith", authorRole: "Helpdesk", time: "14:50" },
    ],
  },

  // ─── Extra cases for the demo customer (Amara Osei) — exercises every
  // friendly status on the customer dashboard ────────────────────────────────
  {
    id: 6,
    caseId: "CASE-006",
    title: "Smoke alarm beeping intermittently",
    description: "The smoke alarm in the kitchen has been beeping every few minutes since last night. I think the battery might be low but I can't reach it safely. Could someone check it please?",
    category: ISSUE_CATEGORIES[3],
    ServiceCategory: SUB_CATEGORIES_ISSUE[4]?.issues?.[0] ?? null,
    priority: PRIORITIES[2], // High
    case_status: "New",
    requestTypes: REQUEST_TYPES[0],
    source: SOURCE_TYPES[3], // Web Portal
    sharedIssue: false,
    location: {
      campus: REQUESTER.campus, building: REQUESTER.building, block: REQUESTER.block,
      floor: REQUESTER.floor, flat: REQUESTER.flat, room: ROOMS[0],
    },
    affectedRequester: REQUESTER,
    requester: {
      displayName: REQUESTER.displayName, email: REQUESTER.email,
      isStudent: REQUESTER.isStudent, clientEmployee: REQUESTER.clientEmployee,
      requesterExist: true, site: REQUESTER.site, contractType: REQUESTER.contractType,
    },
    messages: [
      {
        from: "tenant",
        subject: "New request — CASE-006",
        text: "The smoke alarm in the kitchen has been beeping every few minutes since last night. I think the battery might be low but I can't reach it safely. Could someone check it please?",
        time: "20:30",
        channel: "Web Portal",
      },
      {
        from: "agent",
        subject: "Your request CASE-006 — received",
        text: "Dear Amara,\n\nThank you for getting in touch with us. We are currently reviewing your case (CASE-006) to arrange for the work to be carried out.\n\nYou can follow live progress here: https://track.facility.app/track-case/CASE-006\n\nPlease quote your case reference in any future correspondence.\n\nCase: CASE-006\n\nKind regards,\nFacility Support Team",
        time: "20:32",
        auto: true,
      },
    ],
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    createdBy: REQUESTER.displayName,
    woNotes: [
      { id: 1006, text: "Thanks for flagging this — smoke alarms are safety-critical so we're prioritising. An engineer will swap the battery within 24 hours.", internal: false, author: "Jordan Smith", authorRole: "Helpdesk", time: "20:38" },
    ],
  },
  {
    id: 7,
    caseId: "CASE-007",
    title: "Bedroom window won't close properly",
    description: "The bedroom window has been sticking and won't close fully — there is a noticeable draught coming through. The handle still works but the seal doesn't grip.",
    category: ISSUE_CATEGORIES[3],
    ServiceCategory: SUB_CATEGORIES_ISSUE[3]?.issues?.[1] ?? null,
    priority: PRIORITIES[1], // Medium
    case_status: "Converted",
    requestTypes: REQUEST_TYPES[0],
    source: SOURCE_TYPES[0], // Email
    sharedIssue: false,
    workOrderNumber: "WO-2004",
    workOrderStatus: "Acknowledged",
    workOrderCreatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    dispatchedAt:    new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    acknowledgedAt:  new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    scheduledDate:   new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    scheduledTime:   "10:30",
    estimatedDuration: "1 hour",
    assignedTo:        "Tom Okafor",
    assignedToId:      103,
    assignedEngineers: [
      { id: 103, displayName: "Tom Okafor", workerRole: "Maintenance Engineer", isLead: true },
    ],
    location: {
      campus: REQUESTER.campus, building: REQUESTER.building, block: REQUESTER.block,
      floor: REQUESTER.floor, flat: REQUESTER.flat, room: ROOMS[3],
    },
    affectedRequester: REQUESTER,
    requester: {
      displayName: REQUESTER.displayName, email: REQUESTER.email,
      isStudent: REQUESTER.isStudent, clientEmployee: REQUESTER.clientEmployee,
      requesterExist: true, site: REQUESTER.site, contractType: REQUESTER.contractType,
    },
    messages: [
      {
        from: "tenant",
        subject: "Window not closing",
        text: "Hi,\n\nThe bedroom window has been sticking and won't close fully. There is a noticeable draught coming through. The handle still works but the seal doesn't grip.\n\nThanks,\nAmara",
        time: "16:20",
      },
      {
        from: "agent",
        subject: "Your request CASE-007 — received",
        text: "Dear Amara,\n\nThank you for getting in touch with us. We are currently reviewing your case (CASE-007) to arrange for the work to be carried out.\n\nYou can follow live progress here: https://track.facility.app/track-case/CASE-007\n\nPlease quote your case reference in any future correspondence.\n\nCase: CASE-007\n\nKind regards,\nFacility Support Team",
        time: "16:22",
        auto: true,
      },
      {
        from: "agent",
        subject: "Your request CASE-007 — work scheduled",
        text: "Dear Amara,\n\nThank you for getting in touch with us. We have reviewed your case (CASE-007) and arranged for the work to be carried out.\n\nYou can follow live progress here: https://track.facility.app/track-case/CASE-007\n\nPlease quote your case reference in any future correspondence.\n\nCase: CASE-007\n\nKind regards,\nFacility Support Team",
        time: "16:45",
      },
      {
        from: "agent",
        subject: "Update on CASE-007 — Engineer Assigned",
        text: "Dear Amara,\n\nAn engineer has been assigned to Bedroom window won't close properly. Tom Okafor will be carrying out the work.\n\nYou can follow live progress here: https://track.facility.app/track-case/CASE-007\n\nCase: CASE-007\n\nKind regards,\nFacility Support Team",
        time: "09:15",
      },
    ],
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    createdBy: REQUESTER.displayName,
    woNotes: [
      { id: 701, text: "Looking forward to seeing you tomorrow at 10:30 — please leave the bedroom door unlocked if you're out.", internal: false, author: "Tom Okafor", authorRole: "Maintenance Engineer", time: "09:18" },
    ],
    woLog: [
      { id: 701, text: "Work order WO-2004 dispatched to maintenance team", author: CURRENT_AGENT, time: "16:45", date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), dotColor: "bg-electricBlue" },
      { id: 702, text: "Status changed to Acknowledged", author: "Tom Okafor", time: "09:15", date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), dotColor: "bg-purple-400" },
    ],
  },
  {
    id: 8,
    caseId: "CASE-008",
    title: "Loose cupboard handle in kitchen",
    description: "One of the kitchen cupboard handles has come loose and keeps coming off when I open it. The screws appear to have stripped.",
    category: ISSUE_CATEGORIES[3],
    ServiceCategory: SUB_CATEGORIES_ISSUE[3]?.issues?.[0] ?? null,
    priority: PRIORITIES[0], // Low
    case_status: "Converted",
    requestTypes: REQUEST_TYPES[0],
    source: SOURCE_TYPES[3], // Web Portal
    sharedIssue: false,
    workOrderNumber: "WO-2005",
    workOrderStatus: "In Progress",
    workOrderCreatedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    dispatchedAt:    new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    acknowledgedAt:  new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    inProgressAt:    new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    scheduledDate:   new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    scheduledTime:   "14:00",
    estimatedDuration: "45 minutes",
    assignedTo:        "Sarah Mills",
    assignedToId:      102,
    assignedEngineers: [
      { id: 102, displayName: "Sarah Mills", workerRole: "Maintenance Engineer", isLead: true },
    ],
    location: {
      campus: REQUESTER.campus, building: REQUESTER.building, block: REQUESTER.block,
      floor: REQUESTER.floor, flat: REQUESTER.flat, room: ROOMS[0],
    },
    affectedRequester: REQUESTER,
    requester: {
      displayName: REQUESTER.displayName, email: REQUESTER.email,
      isStudent: REQUESTER.isStudent, clientEmployee: REQUESTER.clientEmployee,
      requesterExist: true, site: REQUESTER.site, contractType: REQUESTER.contractType,
    },
    messages: [
      {
        from: "tenant",
        subject: "New request — CASE-008",
        text: "One of the kitchen cupboard handles has come loose and keeps coming off when I open it. The screws appear to have stripped.",
        time: "11:05",
        channel: "Web Portal",
      },
      {
        from: "agent",
        subject: "Your request CASE-008 — received",
        text: "Dear Amara,\n\nThank you for getting in touch with us. We are currently reviewing your case (CASE-008) to arrange for the work to be carried out.\n\nYou can follow live progress here: https://track.facility.app/track-case/CASE-008\n\nPlease quote your case reference in any future correspondence.\n\nCase: CASE-008\n\nKind regards,\nFacility Support Team",
        time: "11:07",
        auto: true,
      },
      {
        from: "agent",
        subject: "Your request CASE-008 — work scheduled",
        text: "Dear Amara,\n\nThank you for getting in touch with us. We have reviewed your case (CASE-008) and arranged for the work to be carried out.\n\nYou can follow live progress here: https://track.facility.app/track-case/CASE-008\n\nPlease quote your case reference in any future correspondence.\n\nCase: CASE-008\n\nKind regards,\nFacility Support Team",
        time: "11:30",
      },
      {
        from: "agent",
        subject: "Update on CASE-008 — Engineer Assigned",
        text: "Dear Amara,\n\nAn engineer has been assigned to Loose cupboard handle in kitchen. Sarah Mills will be carrying out the work.\n\nYou can follow live progress here: https://track.facility.app/track-case/CASE-008\n\nCase: CASE-008\n\nKind regards,\nFacility Support Team",
        time: "09:30",
      },
      {
        from: "agent",
        subject: "Update on CASE-008 — Work Has Begun",
        text: "Dear Amara,\n\nWe wanted to let you know that work has now started on Loose cupboard handle in kitchen.\n\nYour assigned engineer is Sarah Mills. We will update you once the work is complete.\n\nYou can follow live progress here: https://track.facility.app/track-case/CASE-008\n\nCase: CASE-008\n\nKind regards,\nMaintenance Team",
        time: "14:05",
      },
    ],
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    createdBy: REQUESTER.displayName,
    woNotes: [
      { id: 1008, text: "Hi Amara — I'm on site now. The screw holes are stripped so I'll fit replacement handles with longer screws. Quick job, should be done within the hour.", internal: false, author: "Sarah Mills", authorRole: "Maintenance Engineer", time: "14:05" },
    ],
  },
  {
    id: 9,
    caseId: "CASE-009",
    title: "Blocked shower drain",
    description: "The shower in my flat has been draining very slowly for the past week and is now almost completely blocked.",
    category: ISSUE_CATEGORIES[1],
    ServiceCategory: SUB_CATEGORIES_ISSUE[2]?.issues?.[0] ?? null,
    priority: PRIORITIES[1], // Medium
    case_status: "Converted",
    requestTypes: REQUEST_TYPES[0],
    source: SOURCE_TYPES[0], // Email
    sharedIssue: false,
    workOrderNumber: "WO-2006",
    workOrderStatus: "Completed",
    workOrderCreatedAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
    dispatchedAt:    new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
    acknowledgedAt:  new Date(Date.now() - 11 * 24 * 60 * 60 * 1000).toISOString(),
    inProgressAt:    new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    completedAt:     new Date(Date.now() -  9 * 24 * 60 * 60 * 1000).toISOString(),
    scheduledDate:   new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    scheduledTime:   "13:30",
    estimatedDuration: "1.5 hours",
    assignedTo:        "David Osei",
    assignedToId:      101,
    assignedEngineers: [
      { id: 101, displayName: "David Osei", workerRole: "Maintenance Engineer", isLead: true },
    ],
    location: {
      campus: REQUESTER.campus, building: REQUESTER.building, block: REQUESTER.block,
      floor: REQUESTER.floor, flat: REQUESTER.flat, room: ROOMS[1],
    },
    affectedRequester: REQUESTER,
    requester: {
      displayName: REQUESTER.displayName, email: REQUESTER.email,
      isStudent: REQUESTER.isStudent, clientEmployee: REQUESTER.clientEmployee,
      requesterExist: true, site: REQUESTER.site, contractType: REQUESTER.contractType,
    },
    messages: [
      {
        from: "tenant",
        subject: "Slow drain in shower",
        text: "Hi,\n\nThe shower in my flat has been draining very slowly for the past week and is now almost completely blocked. Could someone come and unblock it?\n\nThanks,\nAmara",
        time: "09:20",
      },
      {
        from: "agent",
        subject: "Your request CASE-009 — received",
        text: "Dear Amara,\n\nThank you for getting in touch with us. We are currently reviewing your case (CASE-009) to arrange for the work to be carried out.\n\nYou can follow live progress here: https://track.facility.app/track-case/CASE-009\n\nPlease quote your case reference in any future correspondence.\n\nCase: CASE-009\n\nKind regards,\nFacility Support Team",
        time: "09:22",
        auto: true,
      },
      {
        from: "agent",
        subject: "Your request CASE-009 — work scheduled",
        text: "Dear Amara,\n\nThank you for getting in touch with us. We have reviewed your case (CASE-009) and arranged for the work to be carried out.\n\nYou can follow live progress here: https://track.facility.app/track-case/CASE-009\n\nPlease quote your case reference in any future correspondence.\n\nCase: CASE-009\n\nKind regards,\nFacility Support Team",
        time: "09:40",
      },
      {
        from: "agent",
        subject: "Update on CASE-009 — Engineer Assigned",
        text: "Dear Amara,\n\nAn engineer has been assigned to Blocked shower drain. David Osei will be carrying out the work.\n\nYou can follow live progress here: https://track.facility.app/track-case/CASE-009\n\nCase: CASE-009\n\nKind regards,\nFacility Support Team",
        time: "10:15",
      },
      {
        from: "agent",
        subject: "Update on CASE-009 — Work Has Begun",
        text: "Dear Amara,\n\nWe wanted to let you know that work has now started on Blocked shower drain.\n\nYour assigned engineer is David Osei. We will update you once the work is complete.\n\nYou can follow live progress here: https://track.facility.app/track-case/CASE-009\n\nCase: CASE-009\n\nKind regards,\nMaintenance Team",
        time: "13:30",
      },
      {
        from: "agent",
        subject: "Update on CASE-009 — Completed",
        text: "Dear Amara,\n\nWe are pleased to confirm that the work for Blocked shower drain has been completed.\n\nYou can follow live progress here: https://track.facility.app/track-case/CASE-009\n\nIf you experience any further issues, please do not hesitate to contact us.\n\nCase: CASE-009\n\nKind regards,\nFacility Support Team",
        time: "15:10",
      },
    ],
    createdAt: new Date(Date.now() - 13 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() -  9 * 24 * 60 * 60 * 1000).toISOString(),
    createdBy: REQUESTER.displayName,
    woNotes: [
      { id: 901, text: "Drain has been fully cleared. We removed a build-up of hair near the trap. Should run freely now — let us know if it slows again.", internal: false, author: "David Osei", authorRole: "Maintenance Engineer", time: "15:08" },
    ],
  },
  {
    id: 10,
    caseId: "CASE-010",
    title: "Bathroom extractor fan very noisy",
    description: "The extractor fan in the bathroom has started making a loud rattling sound whenever it runs.",
    category: ISSUE_CATEGORIES[0],
    ServiceCategory: SUB_CATEGORIES_ISSUE[1]?.issues?.[0] ?? null,
    priority: PRIORITIES[0], // Low
    case_status: "Cancelled",
    requestTypes: REQUEST_TYPES[0],
    source: SOURCE_TYPES[3], // Web Portal
    sharedIssue: false,
    location: {
      campus: REQUESTER.campus, building: REQUESTER.building, block: REQUESTER.block,
      floor: REQUESTER.floor, flat: REQUESTER.flat, room: ROOMS[1],
    },
    affectedRequester: REQUESTER,
    requester: {
      displayName: REQUESTER.displayName, email: REQUESTER.email,
      isStudent: REQUESTER.isStudent, clientEmployee: REQUESTER.clientEmployee,
      requesterExist: true, site: REQUESTER.site, contractType: REQUESTER.contractType,
    },
    messages: [
      {
        from: "tenant",
        subject: "New request — CASE-010",
        text: "The extractor fan in the bathroom has started making a loud rattling sound whenever it runs.",
        time: "18:00",
        channel: "Web Portal",
      },
      {
        from: "agent",
        subject: "Your request CASE-010 — received",
        text: "Dear Amara,\n\nThank you for getting in touch with us. We are currently reviewing your case (CASE-010) to arrange for the work to be carried out.\n\nYou can follow live progress here: https://track.facility.app/track-case/CASE-010\n\nPlease quote your case reference in any future correspondence.\n\nCase: CASE-010\n\nKind regards,\nFacility Support Team",
        time: "18:05",
        auto: true,
      },
      {
        from: "tenant",
        subject: "Cancel request",
        text: "Hi — please cancel this one. It sorted itself out after I gave it a clean. Sorry for the trouble!",
        time: "08:15",
      },
    ],
    createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    createdBy: REQUESTER.displayName,
  },

  // ─── Completed cases this week (to populate My Performance graph) ──────────────
  ...buildCompletedThisWeek(),
];

// ───────────────────────────────────────────────────────────────────────────────
// Quick-seed helper for "completed this week" data so My Performance has bars.
// Each entry lands on a specific weekday at noon, regardless of when the app
// is opened, because we compute from the Monday-anchored start of this week.
// ───────────────────────────────────────────────────────────────────────────────
function buildCompletedThisWeek() {
  const monday = mondayOfThisWeek();

  // weekday: 0=Mon, 1=Tue, 2=Wed, 3=Thu, 4=Fri
  const seeds = [
    { wd: 0, title: "Communal kitchen light flickering",        prio: PRIORITIES[0], src: SOURCE_TYPES[3], eng: "David Osei",   cat: 0, sub: 0 },
    { wd: 0, title: "Loose handrail in stairwell",              prio: PRIORITIES[1], src: SOURCE_TYPES[1], eng: "Sarah Mills",  cat: 3, sub: 0 },
    { wd: 1, title: "Washing machine door not sealing",         prio: PRIORITIES[1], src: SOURCE_TYPES[0], eng: "Tom Okafor",   cat: 0, sub: 1 },
    { wd: 1, title: "Internet point not working in study room", prio: PRIORITIES[0], src: SOURCE_TYPES[3], eng: "James Knight", cat: 2, sub: 0 },
    { wd: 1, title: "Toilet flush not stopping",                prio: PRIORITIES[2], src: SOURCE_TYPES[1], eng: "David Osei",   cat: 1, sub: 0 },
    { wd: 2, title: "Bathroom mirror cracked",                  prio: PRIORITIES[0], src: SOURCE_TYPES[3], eng: "Sarah Mills",  cat: 3, sub: 1 },
    { wd: 2, title: "Microwave plate broken",                   prio: PRIORITIES[0], src: SOURCE_TYPES[2], eng: "Tom Okafor",   cat: 0, sub: 1 },
    { wd: 2, title: "Smoke detector battery beep",              prio: PRIORITIES[1], src: SOURCE_TYPES[1], eng: "James Knight", cat: 4, sub: 0 },
    { wd: 2, title: "Wardrobe door off hinge",                  prio: PRIORITIES[0], src: SOURCE_TYPES[0], eng: "David Osei",   cat: 3, sub: 0 },
    { wd: 3, title: "Hot water lukewarm in shared bathroom",    prio: PRIORITIES[2], src: SOURCE_TYPES[1], eng: "Sarah Mills",  cat: 0, sub: 0 },
    { wd: 3, title: "Radiator cold in bedroom",                 prio: PRIORITIES[1], src: SOURCE_TYPES[0], eng: "Tom Okafor",   cat: 0, sub: 0 },
  ];

  return seeds.map((s, i) => {
    const createdAt    = new Date(monday.getTime() + s.wd * 86_400_000 - 2 * 86_400_000).toISOString();
    const woCreatedAt  = new Date(monday.getTime() + s.wd * 86_400_000 + 8  * 3_600_000).toISOString();
    const ackAt        = new Date(monday.getTime() + s.wd * 86_400_000 + 9  * 3_600_000).toISOString();
    const inProgressAt = new Date(monday.getTime() + s.wd * 86_400_000 + 10 * 3_600_000).toISOString();
    const completedAt  = new Date(monday.getTime() + s.wd * 86_400_000 + 12 * 3_600_000).toISOString();
    const id           = 100 + i;
    const caseId       = `CASE-${String(11 + i).padStart(3, "0")}`;
    const wo           = `WO-${2100 + i}`;
    const cat          = SUB_CATEGORIES_ISSUE[s.cat] ?? SUB_CATEGORIES_ISSUE[0];
    const sub          = cat?.issues?.[s.sub] ?? cat?.issues?.[0] ?? null;

    return {
      id,
      caseId,
      title:       s.title,
      description: s.title,
      category:    ISSUE_CATEGORIES[s.cat] ?? ISSUE_CATEGORIES[0],
      ServiceCategory: sub,
      priority:    s.prio,
      case_status: "Converted",
      requestTypes: REQUEST_TYPES[0],
      source:      s.src,
      sharedIssue: false,
      workOrderNumber:    wo,
      workOrderStatus:    "Completed",
      workOrderCreatedAt: woCreatedAt,
      dispatchedAt:       woCreatedAt,
      acknowledgedAt:     ackAt,
      inProgressAt:       inProgressAt,
      completedAt:        completedAt,
      scheduledDate:      completedAt.split("T")[0],
      scheduledTime:      "10:00",
      estimatedDuration:  "1 hour",
      assignedTo:         s.eng,
      assignedEngineers:  [{ id: 100 + i, displayName: s.eng, workerRole: "Maintenance Engineer", isLead: true }],
      location: {
        campus: REQUESTER.campus,
        building: REQUESTER.building,
        block: REQUESTER.block,
        floor: REQUESTER.floor,
        flat: REQUESTER.flat,
        room: ROOMS[i % ROOMS.length],
      },
      affectedRequester: REQUESTER,
      requester: {
        displayName: REQUESTER.displayName,
        email: REQUESTER.email,
        isStudent: REQUESTER.isStudent,
        clientEmployee: REQUESTER.clientEmployee,
        requesterExist: true,
        site: REQUESTER.site,
        contractType: REQUESTER.contractType,
      },
      messages: [
        {
          from: "tenant",
          subject: `New request — ${caseId}`,
          text: s.title,
          time: "09:00",
          channel: s.src,
        },
        {
          from: "agent",
          subject: `Your request ${caseId} — received`,
          text: `Dear ${REQUESTER.displayName.split(" ")[0]},\n\nThank you for getting in touch with us. We are currently reviewing your case (${caseId}) to arrange for the work to be carried out.\n\nYou can follow live progress here: https://track.facility.app/track-case/${caseId}\n\nPlease quote your case reference in any future correspondence.\n\nCase: ${caseId}\n\nKind regards,\nFacility Support Team`,
          time: "09:02",
          auto: true,
        },
        {
          from: "agent",
          subject: `Your request ${caseId} — work scheduled`,
          text: `Dear ${REQUESTER.displayName.split(" ")[0]},\n\nThank you for getting in touch with us. We have reviewed your case (${caseId}) and arranged for the work to be carried out.\n\nYou can follow live progress here: https://track.facility.app/track-case/${caseId}\n\nPlease quote your case reference in any future correspondence.\n\nCase: ${caseId}\n\nKind regards,\nFacility Support Team`,
          time: "08:00",
        },
        {
          from: "agent",
          subject: `Update on ${caseId} — Engineer Assigned`,
          text: `Dear ${REQUESTER.displayName.split(" ")[0]},\n\nAn engineer has been assigned to ${s.title}. ${s.eng} will be carrying out the work.\n\nYou can follow live progress here: https://track.facility.app/track-case/${caseId}\n\nCase: ${caseId}\n\nKind regards,\nFacility Support Team`,
          time: "09:00",
        },
        {
          from: "agent",
          subject: `Update on ${caseId} — Work Has Begun`,
          text: `Dear ${REQUESTER.displayName.split(" ")[0]},\n\nWe wanted to let you know that work has now started on ${s.title}.\n\nYour assigned engineer is ${s.eng}. We will update you once the work is complete.\n\nYou can follow live progress here: https://track.facility.app/track-case/${caseId}\n\nCase: ${caseId}\n\nKind regards,\nMaintenance Team`,
          time: "10:00",
        },
        {
          from: "agent",
          subject: `Update on ${caseId} — Completed`,
          text: `Dear ${REQUESTER.displayName.split(" ")[0]},\n\nWe are pleased to confirm that the work for ${s.title} has been completed.\n\nYou can follow live progress here: https://track.facility.app/track-case/${caseId}\n\nIf you experience any further issues, please do not hesitate to contact us.\n\nCase: ${caseId}\n\nKind regards,\nFacility Support Team`,
          time: "12:00",
        },
      ],
      createdAt,
      updatedAt: completedAt,
      createdBy: CURRENT_AGENT,
      woNotes: [
        { id: 5000 + i, text: "Job completed and tested — all working as expected.", internal: false, author: s.eng, authorRole: "Maintenance Engineer", time: "12:00" },
      ],
      // Phone-source cases get a seeded call log — initial call when raised,
      // plus a quick follow-up call confirming the engineer is on their way.
      // Notes are editable; transcription is auto-saved on each call.
      ...(s.src === SOURCE_TYPES[1] ? {
        callSessions: [
          {
            id:            `call-${id}-initial`,
            startedAt:     createdAt,
            notes: [
              `• Caller reported: ${s.title}`,
              `• Location: ${REQUESTER.building}, ${REQUESTER.flat}`,
              `• Confirmed contact details on file`,
              `• Raised case and confirmed engineer would be in touch`,
            ].join("\n"),
            transcription: [
              `Agent: Good morning, NexaHub Facilities Helpdesk, how can I help?`,
              `${REQUESTER.displayName.split(" ")[0]}: Hi, I'm calling about ${s.title.toLowerCase()}.`,
              `Agent: Can I take your name and address please?`,
              `${REQUESTER.displayName.split(" ")[0]}: ${REQUESTER.displayName}, ${REQUESTER.building}, ${REQUESTER.flat}.`,
              `Agent: Thanks. When did the issue start?`,
              `${REQUESTER.displayName.split(" ")[0]}: It's been going on for a couple of days now.`,
              `Agent: Understood — I'll raise this as ${caseId} and get an engineer assigned. You'll get a confirmation email shortly.`,
              `${REQUESTER.displayName.split(" ")[0]}: Thank you.`,
              `Agent: You're welcome — have a good day.`,
            ].join("\n"),
          },
          {
            id:            `call-${id}-followup`,
            startedAt:     ackAt,
            notes: [
              `• Follow-up call to confirm engineer ETA`,
              `• Caller confirmed they'll be in`,
              `• No new issues raised`,
            ].join("\n"),
            transcription: [
              `Agent: Hello ${REQUESTER.displayName.split(" ")[0]}, calling back about ${caseId}.`,
              `${REQUESTER.displayName.split(" ")[0]}: Yes, thanks for getting back to me.`,
              `Agent: Just a quick update — ${s.eng} is on the way and should be with you within the hour.`,
              `${REQUESTER.displayName.split(" ")[0]}: Perfect, I'll be in.`,
              `Agent: Great — anything else you need from us?`,
              `${REQUESTER.displayName.split(" ")[0]}: No that's all, thank you.`,
              `Agent: You're welcome. Bye for now.`,
            ].join("\n"),
          },
        ],
      } : {}),
    };
  });
}

function mondayOfThisWeek() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  const dow = d.getDay();              // 0=Sun..6=Sat
  const offset = dow === 0 ? -6 : 1 - dow;
  d.setDate(d.getDate() + offset);
  return d;
}
