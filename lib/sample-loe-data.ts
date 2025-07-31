import { LOE, Task, Milestone } from "./data-context";

export const sampleLOEs: LOE[] = [
  {
    id: "loe-1",
    name: "Capture Capability Requirements and Current Solutions",
    purpose: "Identify mission needs, capability requirements and currently available solutions",
    startDate: "2024-01-01",
    endDate: "2024-03-31",
    deliverable: "Documented capability requirements and current solutions",
    leadOrg: "CPMR",
    supportingOrg: "IAPR, TMTR",
    cpmrContributions: "Identify CRs from the JCCL, derived from JWC 3.0, KOPS, CRCs, and Service and Joint documents, and assess them against reference architecture and design.",
    iaprContributions: "Provide all (current and emerging) capability solutions in acquisition aligned to the JCCL CRs (distribution of Supply Classes III, V, and VIII).",
    tmtrContributions: "Offer current technology modernization solutions aligned with JCCL CRs; inventory available R&D initiatives and modernizable PORs with sufficient information to address CR conditions and align R&D efforts to focus investments."
  },
  {
    id: "loe-2",
    name: "Gap and Current Solutions Health Analysis",
    purpose: "Assess gaps, solution health, and programmatic risk",
    startDate: "2024-04-01",
    endDate: "2024-06-30",
    deliverable: "Gap analysis and health assessment report",
    leadOrg: "CPMR",
    supportingOrg: "IAPR, TMTR",
    cpmrContributions: "Provide traceability of capability requirements to capability solutions to operational and capability gaps.",
    iaprContributions: "Provide assessment of health and risk of all acquisition programs and systems (current and emerging) with respect to delivering necessary functionality in desired timeline to determine investment/divestment recommendations.",
    tmtrContributions: "Provide risk assessments of R&D initiatives with respect to delivering necessary technology or enhanced functionality in desired timeline."
  },
  {
    id: "loe-3",
    name: "Solutions Options Development",
    purpose: "Identify solution options, alternatives, and technology opportunities to potentially close gaps and mitigate risks to create tradespace",
    startDate: "2024-07-01",
    endDate: "2024-09-30",
    deliverable: "Solution options and tradespace analysis",
    leadOrg: "IAPR, TMTR",
    supportingOrg: "CPMR",
    cpmrContributions: "Provide materiel and non-material capability solution options traced through CRs to operational and capability gaps.",
    iaprContributions: "Identify potential alternative solutions, including commercial options, to address high-risk capability gaps; highlight solutions with duplicate functionality or misalignment with current needs for further analysis, consolidation, or divestment.",
    tmtrContributions: "Identify alternatives to close high-risk gaps, enhance current solutions, or introduce innovative technologies that create new concepts, achieve previously unattainable goals, or render existing capabilities obsolete."
  },
  {
    id: "loe-4",
    name: "Synthesize All Risks for Decision Support",
    purpose: "Define and weigh operational, programmatic, R&E, and resourcing risks and opportunities within the tradespace",
    startDate: "2024-10-01",
    endDate: "2024-12-31",
    deliverable: "Comprehensive risk synthesis and decision support recommendations",
    leadOrg: "CPMR, IAPR, TMTR",
    supportingOrg: "",
    cpmrContributions: "Define and assess operational and residual risk for each capability solution across near-, mid-, and far-term epochs.",
    iaprContributions: "Recommend acquisition approaches to close gaps, highlighting programmatic risks and offering alternatives, eliminating duplications, and suggesting divestments to aid decision-makers.",
    tmtrContributions: "Offer prioritized R&D and alternative recommendations to close gaps and meet CRs, along with associated risks categorized as high, significant, moderate, or low, to guide decision-makers."
  }
];

export const sampleTasks: Task[] = [
  {
    id: "task-1",
    name: "Identify JCCL Capability Requirements",
    owner: "Alice Smith",
    loeId: "loe-1",
    description: "Review JCCL, JWC 3.0, KOPS, CRCs, and Service/Joint docs to extract capability requirements.",
    startDate: "2024-01-02",
    endDate: "2024-01-15",
    status: "Completed",
    deliverable: "List of capability requirements",
    type: "cpmr",
    assignedTypes: ["CPMR"],
    issues: [],
  },
  {
    id: "task-2",
    name: "Assess Current Solutions",
    owner: "Bob Johnson",
    loeId: "loe-1",
    description: "Catalog current and emerging solutions in acquisition aligned to JCCL CRs.",
    startDate: "2024-01-16",
    endDate: "2024-02-10",
    status: "In Progress",
    deliverable: "Solution catalog",
    type: "iapr",
    assignedTypes: ["IAPR"],
    issues: [{ text: "Missing data for Supply Class V" }],
  },
  {
    id: "task-3",
    name: "Gap Analysis",
    owner: "Carol Lee",
    loeId: "loe-2",
    description: "Trace capability requirements to solutions and identify operational gaps.",
    startDate: "2024-04-05",
    endDate: "2024-04-20",
    status: "Not Started",
    deliverable: "Gap analysis report",
    type: "cpmr",
    assignedTypes: ["CPMR"],
    issues: [],
  },
  {
    id: "task-4",
    name: "Develop Solution Options",
    owner: "David Kim",
    loeId: "loe-3",
    description: "Identify and document solution options and technology opportunities.",
    startDate: "2024-07-10",
    endDate: "2024-08-01",
    status: "Not Started",
    deliverable: "Solution options document",
    type: "iapr",
    assignedTypes: ["IAPR", "TMTR"],
    issues: [],
  },
  {
    id: "task-5",
    name: "Synthesize Risks",
    owner: "Eve Martinez",
    loeId: "loe-4",
    description: "Define and weigh operational, programmatic, and resourcing risks.",
    startDate: "2024-10-05",
    endDate: "2024-10-20",
    status: "Not Started",
    deliverable: "Risk synthesis report",
    type: "tmtr",
    assignedTypes: ["TMTR"],
    issues: [],
  }
];

export const sampleMilestones: Milestone[] = [
  {
    id: "ms-1",
    name: "Requirements Identified",
    description: "All capability requirements have been identified and documented.",
    date: "2024-01-15",
    leadOrg: "CPMR",
    supportingOrg: "IAPR, TMTR",
    deliverable: "Requirements document",
    loeIds: ["loe-1"]
  },
  {
    id: "ms-2",
    name: "Solutions Cataloged",
    description: "All current and emerging solutions have been cataloged.",
    date: "2024-02-10",
    leadOrg: "IAPR",
    supportingOrg: "CPMR, TMTR",
    deliverable: "Solutions catalog",
    loeIds: ["loe-1"]
  },
  {
    id: "ms-3",
    name: "Gap Analysis Complete",
    description: "Gap analysis between requirements and solutions is complete.",
    date: "2024-04-20",
    leadOrg: "CPMR",
    supportingOrg: "IAPR, TMTR",
    deliverable: "Gap analysis report",
    loeIds: ["loe-2"]
  },
  {
    id: "ms-4",
    name: "Solution Options Developed",
    description: "Solution options and tradespace analysis completed.",
    date: "2024-08-01",
    leadOrg: "IAPR",
    supportingOrg: "TMTR, CPMR",
    deliverable: "Solution options document",
    loeIds: ["loe-3"]
  },
  {
    id: "ms-5",
    name: "Risk Synthesis Complete",
    description: "Comprehensive risk synthesis and recommendations delivered.",
    date: "2024-10-20",
    leadOrg: "TMTR",
    supportingOrg: "CPMR, IAPR",
    deliverable: "Risk synthesis report",
    loeIds: ["loe-4"]
  }
]; 