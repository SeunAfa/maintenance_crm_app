import { ISSUE_CATEGORIES } from "../utils/constants";
export const SUB_CATEGORIES_ISSUE = [
  {
    id: "electrical",
    label: ISSUE_CATEGORIES[2],
    accent: "#F59E0B",
    icon: (
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
      </svg>
    ),
    issues: [
      { id: "e1", title: "Power outage", severity: "critical", code: "EL-001" },
      {
        id: "e2",
        title: "Tripped circuit breaker",
        severity: "high",
        code: "EL-002",
      },
      {
        id: "e3",
        title: "Faulty lighting fixture",
        severity: "medium",
        code: "EL-003",
      },
      {
        id: "e4",
        title: "Emergency lighting failure",
        severity: "critical",
        code: "EL-004",
      },
      {
        id: "e5",
        title: "Generator fault",
        severity: "critical",
        code: "EL-005",
      },
      {
        id: "e6",
        title: "Damaged socket / outlet",
        severity: "medium",
        code: "EL-006",
      },
    ],
  },
  {
    id: "hvac",
    label: ISSUE_CATEGORIES[0],
    accent: "#38BDF8",
    icon: (
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 2v20M2 12h20M4.93 4.93l14.14 14.14M19.07 4.93 4.93 19.07" />
      </svg>
    ),
    issues: [
      {
        id: "h1",
        title: "No heating / cooling",
        severity: "high",
        code: "HV-001",
      },
      {
        id: "h2",
        title: "Unusual noise from unit",
        severity: "medium",
        code: "HV-002",
      },
      {
        id: "h3",
        title: "Thermostat malfunction",
        severity: "medium",
        code: "HV-003",
      },
      {
        id: "h4",
        title: "Air filter replacement due",
        severity: "low",
        code: "HV-004",
      },
      {
        id: "h5",
        title: "Refrigerant leak",
        severity: "critical",
        code: "HV-005",
      },
      {
        id: "h6",
        title: "Ventilation blockage",
        severity: "high",
        code: "HV-006",
      },
    ],
  },
  {
    id: "plumbing",
    label: ISSUE_CATEGORIES[1],
    accent: "#34D399",
    icon: (
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
      </svg>
    ),
    issues: [
      { id: "p1", title: "Burst pipe", severity: "critical", code: "PL-001" },
      { id: "p2", title: "Blocked drain", severity: "high", code: "PL-002" },
      {
        id: "p3",
        title: "Leaking tap or fixture",
        severity: "medium",
        code: "PL-003",
      },
      { id: "p4", title: "No hot water", severity: "high", code: "PL-004" },
      {
        id: "p5",
        title: "Toilet not flushing",
        severity: "medium",
        code: "PL-005",
      },
      {
        id: "p6",
        title: "Water pressure issue",
        severity: "medium",
        code: "PL-006",
      },
    ],
  },
  {
    id: "structural",
    label: ISSUE_CATEGORIES[3],
    accent: "#A78BFA",
    icon: (
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
    issues: [
      {
        id: "s1",
        title: "Ceiling crack / collapse risk",
        severity: "critical",
        code: "ST-001",
      },
      {
        id: "s2",
        title: "Door / window not closing",
        severity: "medium",
        code: "ST-002",
      },
      {
        id: "s3",
        title: "Floor damage or trip hazard",
        severity: "high",
        code: "ST-003",
      },
      { id: "s4", title: "Wall crack", severity: "medium", code: "ST-004" },
      { id: "s5", title: "Roof leak", severity: "high", code: "ST-005" },
      {
        id: "s6",
        title: "Loose railing or banister",
        severity: "high",
        code: "ST-006",
      },
    ],
  },
  {
    id: "security",
    label: ISSUE_CATEGORIES[4],
    accent: "#F472B6",
    icon: (
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
    issues: [
      {
        id: "sec1",
        title: "CCTV camera offline",
        severity: "high",
        code: "SE-001",
      },
      {
        id: "sec2",
        title: "Access control failure",
        severity: "critical",
        code: "SE-002",
      },
      {
        id: "sec3",
        title: "Broken lock or door entry",
        severity: "high",
        code: "SE-003",
      },
      {
        id: "sec4",
        title: "Fire alarm triggered",
        severity: "critical",
        code: "SE-004",
      },
      {
        id: "sec5",
        title: "Intruder alert",
        severity: "critical",
        code: "SE-005",
      },
      {
        id: "sec6",
        title: "Panic button fault",
        severity: "high",
        code: "SE-006",
      },
    ],
  },
  {
    id: "cleaning",
    label: ISSUE_CATEGORIES[5],
    accent: "#94A3B8",
    icon: (
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="3 6 5 6 21 6" />
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      </svg>
    ),
    issues: [
      { id: "c1", title: "Overflowing bins", severity: "low", code: "CL-001" },
      {
        id: "c2",
        title: "Hazardous spillage",
        severity: "high",
        code: "CL-002",
      },
      { id: "c3", title: "Pest sighting", severity: "high", code: "CL-003" },
      {
        id: "c4",
        title: "Sanitation concern",
        severity: "medium",
        code: "CL-004",
      },
      {
        id: "c5",
        title: "Graffiti removal needed",
        severity: "low",
        code: "CL-005",
      },
      {
        id: "c6",
        title: "General Cleaning",
        severity: "medium",
        code: "CL-006",
      },
    ],
  },
  {
    id: "lifts",
    label: ISSUE_CATEGORIES[6],
    accent: "#60A5FA",
    icon: (
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="5" y="2" width="14" height="20" rx="2" />
        <path d="M9 10 12 7l3 3M15 14l-3 3-3-3" />
      </svg>
    ),
    issues: [
      {
        id: "l1",
        title: "Lift out of service",
        severity: "critical",
        code: "LI-001",
      },
      {
        id: "l2",
        title: "Lift doors not closing",
        severity: "critical",
        code: "LI-002",
      },
      {
        id: "l3",
        title: "Escalator stopped",
        severity: "high",
        code: "LI-003",
      },
      {
        id: "l4",
        title: "Strange noise in lift",
        severity: "medium",
        code: "LI-004",
      },
      {
        id: "l5",
        title: "Emergency phone fault",
        severity: "critical",
        code: "LI-005",
      },
    ],
  },
  {
    id: "grounds",
    label: ISSUE_CATEGORIES[7],
    accent: "#4ADE80",
    icon: (
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M17 8C8 10 5.9 16.17 3.82 22" />
        <path d="M9.5 9.5C12 10 13 13 12 18" />
        <path d="M14.5 11.5C18 13 18 18 16 21" />
      </svg>
    ),
    issues: [
      {
        id: "g1",
        title: "Car park surface damage",
        severity: "medium",
        code: "GR-001",
      },
      {
        id: "g2",
        title: "Broken fence or gate",
        severity: "medium",
        code: "GR-002",
      },
      { id: "g3", title: "Flooded walkway", severity: "high", code: "GR-003" },
      {
        id: "g4",
        title: "External lighting fault",
        severity: "medium",
        code: "GR-004",
      },
      {
        id: "g5",
        title: "Fallen tree or debris",
        severity: "high",
        code: "GR-005",
      },
    ],
  },
];
