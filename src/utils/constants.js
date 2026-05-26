//Styling ------------------
export const STATUS_STYLE = {
  New:         { dot: "bg-sky-400",    pill: "bg-sky-50 text-sky-700 border-sky-200"        },
  "In Review": { dot: "bg-amber-400",  pill: "bg-amber-50 text-amber-700 border-amber-200"  },
  Qualify:     { dot: "bg-orange-400", pill: "bg-orange-50 text-orange-700 border-orange-200" },
  Action:      { dot: "bg-indigo-400", pill: "bg-indigo-50 text-indigo-700 border-indigo-200" },
  Converted:   { dot: "bg-violet-400", pill: "bg-violet-50 text-violet-700 border-violet-200" },
  Closed:      { dot: "bg-slate-400",  pill: "bg-slate-100 text-slate-500 border-slate-200"  },
};

export const YES_OR_NO = ["Yes", "No"];
//USer Data
//Roles for workers in the system
export const workerRoles = [
  "Helpdesk Support",
  "Security Officer",
  "Cleaning Staff",
  "Maintenance Engineer",
  "Operations Manager",
  "Soft Service Manager",
  "Hard Service Manager",
  "Site Supervisor",
];

export const userRoles = [
  "Student",
  "Client Employee",
  "Contractor",
  "Visitor",
  "OurEmployee",
];
//Case ------------------

//Cases
//Case statuses
export const CASE_STATUSES = ["New", "In Review", "Qualify", "Action", "Converted", "Closed"];
//Case priorities
export const PRIORITIES = ["Low", "Medium", "High", "Urgent", "Critical"];
//Case & WO requester types
export const REQUEST_TYPES = ["Service Request", "Complaint", "Quote"];
//Case Communication Channels - Source type
export const SOURCE_TYPES = ["Email", "Phone", "WhatsApp", "Web Portal"];
//Case Contract Type
export const CONTRACT_TYPES = [
  "Greenwich University",
  "Nestle",
  "HMRC DWP",
  "Unilever",
  "PepsiCo",
];

//Case Site Type
export const SITES = [
  "Greenwich University",
  "Nestle York",
  "Nestle Tutbury",
  "HMRC DWP London",
  "HMRC DWP Manchester",
  "Unilever London",
  "Unilever Manchester",
  "PepsiCo London",
  "PepsiCo Manchester",
];

//CATEGORIES
export const ISSUE_CATEGORIES = [
  "HVAC",
  "Plumbing",
  "Electrical",
  "Structural",
  "Security",
  "Cleaning",
  "Lift & Elevator",
  "Grounds",
];

//Channel Sources Config
// export const CHANNEL_CONFIG = {
//   whatsapp: {
//     label: "WhatsApp",
//     Icon: Icons.WhatsApp,
//     color: "text-emerald-600",
//     bg: "bg-emerald-50",
//     border: "border-emerald-200",
//     pill: "bg-emerald-100 text-emerald-700 border-emerald-200",
//   },
//   email: {
//     label: "Email",
//     Icon: Icons.Email,
//     color: "text-blue-600",
//     bg: "bg-blue-50",
//     border: "border-blue-200",
//     pill: "bg-blue-100 text-blue-700 border-blue-200",
//   },
//   portal: {
//     label: "Web Portal",
//     Icon: Icons.Globe,
//     color: "text-violet-600",
//     bg: "bg-violet-50",
//     border: "border-violet-200",
//     pill: "bg-violet-100 text-violet-700 border-violet-200",
//   },
// };

//WO ------------------
//WO statuses

// ─────────────────────────────────────────────────────────────────────────────
// Location data
// ─────────────────────────────────────────────────────────────────────────────

//Campus
export const CAMPUSES = [
  "North Campus",
  "South Campus",
  "City Campus",
  "Medical Campus",
];
//Blocks
export const BLOCKS = ["A", "B", "C", "D", "E", "F"];
//Buildings
export const CAMPUS_BUILDINGS = [
  {
    Campus: [CAMPUSES[0]],
    building: ["Rutherford Hall", "Maxwell Hall", "Faraday Block"],
  },
  {
    Campus: [CAMPUSES[1]],
    building: ["Ashworth Block", "Renold Building", "Engineering B"],
  },
  {
    Campus: [CAMPUSES[2]],
    building: ["Crawford House", "Alliance MBS", "Whitworth Hall"],
  },
  {
    Campus: [CAMPUSES[3]],
    building: ["Stopford Building", "Oxford Road Clinic", "Medical Sciences"],
  },
];
//Floor
export const FLOORS = [
  "Ground Floor",
  "First Floor",
  "Second Floor",
  "Third Floor",
  "Fourth Floor",
  "Fifth Floor",
  "Sixth Floor",
  "Seventh Floor",
  "Eighth Floor",
  "Ninth Floor",
  "Tenth Floor",
];
//Flats
export const FLATS = [
  "Flat 1",
  "Flat 2",
  "Flat 3",
  "Flat 4",
  "Flat 5",
  "Flat 6",
  "Flat 7",
  "Flat 8",
  "Flat 9",
  "Flat 10",
  "Flat 11",
  "Flat 12",
];
//Rooms
export const ROOMS = [
  "Kitchen",
  "Bathroom",
  "Bathroom2",
  "Room 1",
  "Room 2",
  "Room 3",
  "Room 4",
  "Room 5",
  "Room 6",
  "Ensuite Room 1",
  "Ensuite Room 2",
  "Ensuite Room 3",
  "Ensuite Room 4",
  "Ensuite Room 5",
  "Ensuite Room 6",
];
//Areas

//Requester data
export const REQUESTER = {
  displayName: "Amara Osei",
  firstName: "Amara",
  lastName: "Osei",
  email: "amara.osei@greenwich.ac.uk",
  phone: "0794 567 890",
  site: SITES[0],
  campus: CAMPUSES[0],
  building: CAMPUS_BUILDINGS[0].building[0],
  block: BLOCKS[0],
  floor: FLOORS[0],
  flat: FLATS[0],
  room: ROOMS[3],
  clientEmployee: false,
  isStudent: true,
  contractType: CONTRACT_TYPES[0],
  userRoles: userRoles[1],
  requesterExist: true,
};
