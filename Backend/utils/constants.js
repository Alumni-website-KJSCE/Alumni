// List of available branches
export const BRANCHES = [
  "MECH",
  "PROD",
  "M/C T",
  "ETRX",
  "EXTC",
  "COMP",
  "IT",
  "AIDS",
];

// Branch options with full names for better UX
export const BRANCH_OPTIONS = [
  { value: "COMP", label: "Computer Engineering (COMP)" },
  { value: "IT", label: "Information Technology (IT)" },
  { value: "AIDS", label: "Artificial Intelligence & Data Science (AIDS)" },
  { value: "ETRX", label: "Electronics Engineering (ETRX)" },
  { value: "EXTC", label: "Electronics & Telecommunication (EXTC)" },
  { value: "MECH", label: "Mechanical Engineering (MECH)" },
  { value: "PROD", label: "Production Engineering (PROD)" },
  { value: "M/C T", label: "Machine Tools (M/C T)" },
];

// List of available qualifications
export const QUALIFICATIONS = ["B.Tech", "M.Tech", "PhD"];

// Qualification options with full names for better UX
export const QUALIFICATION_OPTIONS = [
  { value: "B.Tech", label: "Bachelor of Technology (B.Tech)" },
  { value: "M.Tech", label: "Master of Technology (M.Tech)" },
  { value: "PhD", label: "Doctor of Philosophy (PhD)" },
];

// List of available contribution types
export const CONTRIBUTION_TYPES = [
  "Placement Opportunities",
  "Internship Referrals",
  "Industry Projects",
  "Mentorship Programs",
  "Guest Lectures",
  "Research Collaborations",
  "Training & Workshops",
  "Industry Collaborations (MoUs)",
  "Startup Support",
  "Other",
];

// Export other constants as needed
export const USER_STATUS = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
};

export const JOB_TYPES = {
  JOB: "job",
  INTERNSHIP: "internship",
};

export const JOB_MODES = {
  REMOTE: "Remote",
  HYBRID: "Hybrid",
  ONSITE: "Onsite",
};
