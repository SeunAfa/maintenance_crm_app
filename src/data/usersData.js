import { CONTRACT_TYPES, SITES, userRoles } from "../utils/constants";

const GU = CONTRACT_TYPES[0]; // Greenwich University

export const USERS_DATA = [
  // ── Rutherford Hall · Block A ─────────────────────────────────────────────
  { id: 1,  firstName: "Amara",   lastName: "Osei",        displayName: "Amara Osei",        email: "amara.osei@greenwich.ac.uk",       phone: "0794 567 890", contractType: GU, site: SITES[0], userRole: userRoles[0], isStudent: true,  clientEmployee: false, building: "Rutherford Hall", block: "A", floor: "Ground Floor", flat: "Flat 1" },
  { id: 3,  firstName: "Priya",   lastName: "Mehta",       displayName: "Priya Mehta",       email: "priya.mehta@greenwich.ac.uk",      phone: "0782 345 678", contractType: GU, site: SITES[0], userRole: userRoles[0], isStudent: true,  clientEmployee: false, building: "Rutherford Hall", block: "A", floor: "Ground Floor", flat: "Flat 2" },
  { id: 5,  firstName: "Sofia",   lastName: "Andersen",    displayName: "Sofia Andersen",    email: "sofia.andersen@greenwich.ac.uk",   phone: "0743 567 890", contractType: GU, site: SITES[0], userRole: userRoles[0], isStudent: true,  clientEmployee: false, building: "Rutherford Hall", block: "A", floor: "Ground Floor", flat: "Flat 3" },
  { id: 12, firstName: "Kwame",   lastName: "Asante",      displayName: "Kwame Asante",      email: "k.asante@greenwich.ac.uk",         phone: "0756 234 567", contractType: GU, site: SITES[0], userRole: userRoles[0], isStudent: true,  clientEmployee: false, building: "Rutherford Hall", block: "A", floor: "First Floor",  flat: "Flat 4" },
  { id: 13, firstName: "Natasha", lastName: "Petrov",      displayName: "Natasha Petrov",    email: "n.petrov@greenwich.ac.uk",         phone: "0723 345 678", contractType: GU, site: SITES[0], userRole: userRoles[0], isStudent: true,  clientEmployee: false, building: "Rutherford Hall", block: "A", floor: "First Floor",  flat: "Flat 5" },
  { id: 17, firstName: "Yuki",    lastName: "Tanaka",      displayName: "Yuki Tanaka",       email: "y.tanaka@greenwich.ac.uk",         phone: "0798 789 012", contractType: GU, site: SITES[0], userRole: userRoles[0], isStudent: true,  clientEmployee: false, building: "Rutherford Hall", block: "A", floor: "Second Floor", flat: "Flat 6" },

  // ── Rutherford Hall · Block B ─────────────────────────────────────────────
  { id: 2,  firstName: "James",   lastName: "Thornton",    displayName: "James Thornton",    email: "j.thornton@greenwich.ac.uk",       phone: "0771 234 567", contractType: GU, site: SITES[0], userRole: userRoles[1], isStudent: false, clientEmployee: true,  building: "Rutherford Hall", block: "B", floor: "Ground Floor", flat: "Flat 1" },
  { id: 9,  firstName: "Olivia",  lastName: "Hargreaves",  displayName: "Olivia Hargreaves", email: "o.hargreaves@greenwich.ac.uk",     phone: "0734 901 234", contractType: GU, site: SITES[0], userRole: userRoles[1], isStudent: false, clientEmployee: true,  building: "Rutherford Hall", block: "B", floor: "Ground Floor", flat: "Flat 2" },
  { id: 10, firstName: "Ben",     lastName: "Kamau",       displayName: "Ben Kamau",         email: "b.kamau@greenwich.ac.uk",          phone: "0778 012 345", contractType: GU, site: SITES[0], userRole: userRoles[1], isStudent: false, clientEmployee: true,  building: "Rutherford Hall", block: "B", floor: "First Floor",  flat: "Flat 3" },

  // ── Maxwell Hall · Block A ────────────────────────────────────────────────
  { id: 4,  firstName: "Daniel",  lastName: "Hughes",      displayName: "Daniel Hughes",     email: "d.hughes@greenwich.ac.uk",         phone: "0759 456 789", contractType: GU, site: SITES[0], userRole: userRoles[1], isStudent: false, clientEmployee: true,  building: "Maxwell Hall",    block: "A", floor: "Ground Floor", flat: "Flat 1" },
  { id: 6,  firstName: "Marcus",  lastName: "Reid",        displayName: "Marcus Reid",       email: "m.reid@greenwich.ac.uk",           phone: "0712 678 901", contractType: GU, site: SITES[0], userRole: userRoles[1], isStudent: false, clientEmployee: true,  building: "Maxwell Hall",    block: "A", floor: "First Floor",  flat: "Flat 2" },
  { id: 15, firstName: "Aisha",   lastName: "Nwosu",       displayName: "Aisha Nwosu",       email: "a.nwosu@greenwich.ac.uk",          phone: "0745 567 890", contractType: GU, site: SITES[0], userRole: userRoles[1], isStudent: false, clientEmployee: true,  building: "Maxwell Hall",    block: "A", floor: "Second Floor", flat: "Flat 3" },

  // ── Faraday Block · Block A ───────────────────────────────────────────────
  { id: 7,  firstName: "Fiona",   lastName: "Clarke",      displayName: "Fiona Clarke",      email: "f.clarke@greenwich.ac.uk",         phone: "0798 789 012", contractType: GU, site: SITES[0], userRole: userRoles[1], isStudent: false, clientEmployee: true,  building: "Faraday Block",   block: "A", floor: "Ground Floor", flat: "Flat 1" },
  { id: 11, firstName: "Rachel",  lastName: "Owens",       displayName: "Rachel Owens",      email: "r.owens@greenwich.ac.uk",          phone: "0791 123 456", contractType: GU, site: SITES[0], userRole: userRoles[2], isStudent: false, clientEmployee: false, building: "Faraday Block",   block: "A", floor: "Ground Floor", flat: "Flat 2" },
  { id: 16, firstName: "Connor",  lastName: "Walsh",       displayName: "Connor Walsh",      email: "c.walsh@greenwich.ac.uk",          phone: "0712 678 901", contractType: GU, site: SITES[0], userRole: userRoles[2], isStudent: false, clientEmployee: false, building: "Faraday Block",   block: "A", floor: "First Floor",  flat: "Flat 3" },

  // ── No fixed residence (staff / contractors) ──────────────────────────────
  { id: 8,  firstName: "Tariq",   lastName: "Bashir",      displayName: "Tariq Bashir",      email: "t.bashir@greenwich.ac.uk",         phone: "0765 890 123", contractType: GU, site: SITES[0], userRole: userRoles[4], isStudent: false, clientEmployee: false },
  { id: 14, firstName: "Leo",     lastName: "Fernandez",   displayName: "Leo Fernandez",     email: "l.fernandez@greenwich.ac.uk",      phone: "0789 456 789", contractType: GU, site: SITES[0], userRole: userRoles[4], isStudent: false, clientEmployee: false },
  { id: 18, firstName: "Jordan",  lastName: "Smith",       displayName: "Jordan Smith",      email: "j.smith@greenwich.ac.uk",          phone: "0700 000 001", contractType: GU, site: SITES[0], userRole: userRoles[4], isStudent: false, clientEmployee: false, isAgent: true },
];

export const CURRENT_AGENT = "Jordan Smith";

// ─── Maintenance workers / engineers ──────────────────────────────────────────
// campuses  — which campuses the engineer is deployed to
// skills    — matches SUB_CATEGORIES_ISSUE group ids: "plumbing","hvac","electrical","structural","security","cleaning","lift","grounds"
// shift     — days: ISO weekday numbers [1=Mon … 7=Sun]; hours: "HH:MM–HH:MM"
export const WORKERS_DATA = [
  {
    id: 101, firstName: "David",  lastName: "Osei",   displayName: "David Osei",   email: "d.osei@greenwich.ac.uk",   phone: "0700 111 001",
    contractType: GU, site: SITES[0], workerRole: "Maintenance Engineer", isWorker: true,
    campuses: ["North Campus"],
    skills:   ["plumbing", "structural"],
    shift:    { days: [1,2,3,4,5], hours: "08:00–16:30", label: "Mon–Fri" },
  },
  {
    id: 102, firstName: "Sarah",  lastName: "Mills",  displayName: "Sarah Mills",  email: "s.mills@greenwich.ac.uk",  phone: "0700 111 002",
    contractType: GU, site: SITES[0], workerRole: "Maintenance Engineer", isWorker: true,
    campuses: ["North Campus", "South Campus"],
    skills:   ["hvac", "electrical"],
    shift:    { days: [1,2,3,4,5], hours: "07:00–15:00", label: "Mon–Fri" },
  },
  {
    id: 103, firstName: "Tom",    lastName: "Okafor", displayName: "Tom Okafor",   email: "t.okafor@greenwich.ac.uk", phone: "0700 111 003",
    contractType: GU, site: SITES[0], workerRole: "Site Supervisor", isWorker: true,
    campuses: ["North Campus", "South Campus", "City Campus", "Medical Campus"],
    skills:   ["plumbing", "hvac", "electrical", "structural", "security", "grounds"],
    shift:    { days: [1,2,3,4,5,6,7], hours: "06:00–14:00", label: "Mon–Sun (rotating)" },
  },
  {
    id: 104, firstName: "Lisa",   lastName: "Chen",   displayName: "Lisa Chen",    email: "l.chen@greenwich.ac.uk",   phone: "0700 111 004",
    contractType: GU, site: SITES[0], workerRole: "Maintenance Engineer", isWorker: true,
    campuses: ["City Campus", "Medical Campus"],
    skills:   ["electrical", "lift"],
    shift:    { days: [1,2,3,4,5], hours: "09:00–17:00", label: "Mon–Fri" },
  },
  {
    id: 105, firstName: "Mark",   lastName: "Davies", displayName: "Mark Davies",  email: "m.davies@greenwich.ac.uk", phone: "0700 111 005",
    contractType: GU, site: SITES[0], workerRole: "Hard Service Manager", isWorker: true,
    campuses: ["North Campus", "South Campus", "City Campus", "Medical Campus"],
    skills:   ["hvac", "plumbing", "electrical", "structural", "security", "cleaning", "lift", "grounds"],
    shift:    { days: [1,2,3,4,5], hours: "08:00–17:00", label: "Mon–Fri" },
  },
  {
    id: 106, firstName: "Priya",  lastName: "Sharma", displayName: "Priya Sharma", email: "p.sharma@greenwich.ac.uk", phone: "0700 111 006",
    contractType: GU, site: SITES[0], workerRole: "Maintenance Engineer", isWorker: true,
    campuses: ["South Campus", "City Campus"],
    skills:   ["cleaning", "structural", "grounds"],
    shift:    { days: [1,2,3,4,5], hours: "10:00–18:00", label: "Mon–Fri" },
  },
  {
    id: 107, firstName: "James",  lastName: "Knight", displayName: "James Knight", email: "j.knight@greenwich.ac.uk", phone: "0700 111 007",
    contractType: GU, site: SITES[0], workerRole: "Maintenance Engineer", isWorker: true,
    campuses: ["North Campus"],
    skills:   ["electrical", "hvac", "lift"],
    shift:    { days: [1,2,3,4,5], hours: "07:00–15:00", label: "Mon–Fri" },
  },
];
