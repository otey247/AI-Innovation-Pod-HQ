/* =====================================================================
   Mock data shared across all three Pod HQ tools
   ===================================================================== */

// ── Shared types ──────────────────────────────────────────────────────

export type SkillLevel = 'Expert' | 'Proficient' | 'Beginner' | 'None'

export interface Consultant {
  id: string
  name: string
  title: string
  location: string
  available: boolean            // currently on bench / short allocation
  travelWillingness: 'Any' | 'Domestic' | 'Limited' | 'Remote Only'
  careerGoal: string
  skills: Record<string, SkillLevel>
  certifications: string[]
  industries: string[]
  platforms: string[]
  yearsExp: number
  utilizationPct: number        // 0-100
  hourlyRate: number            // fully-loaded blended rate
  caseCount: number
}

export interface Pursuit {
  id: string
  name: string
  client: string
  status: 'Active' | 'Pursuit'
  requiredSkills: string[]
  industry: string
  platform: string
  startDate: string
  endDate: string
  teamSize: number
  assignedConsultants: string[] // consultant ids
}

// ── Skill taxonomy ────────────────────────────────────────────────────

export const ALL_SKILLS = [
  'Cloud Architecture',
  'Data Engineering',
  'Machine Learning / AI',
  'Generative AI',
  'DevOps / CI-CD',
  'Solution Architecture',
  'Change Management',
  'Agile / Scrum',
  'Business Analysis',
  'Cybersecurity',
  'UI / UX Design',
  'Integration / APIs',
  'Analytics & BI',
  'Project Management',
  'Industry SME',
]

export const ALL_CAPABILITIES = [
  'Cloud & Infrastructure',
  'Data & Analytics',
  'AI / Machine Learning',
  'Generative AI',
  'DevOps & Automation',
  'Enterprise Architecture',
  'Change & Adoption',
  'Agile Delivery',
  'Cybersecurity',
  'Digital Product Design',
  'System Integration',
  'Programme Management',
]

export const ALL_PLATFORMS = [
  'AWS',
  'Azure',
  'GCP',
  'Salesforce',
  'SAP',
  'ServiceNow',
  'Snowflake',
  'Databricks',
  'OpenAI / Azure OpenAI',
  'Google Vertex AI',
]

export const ALL_INDUSTRIES = [
  'Financial Services',
  'Healthcare',
  'Government',
  'Retail',
  'Energy',
  'Telco',
  'Manufacturing',
  'Professional Services',
]

// ── Consultants ───────────────────────────────────────────────────────

export const CONSULTANTS: Consultant[] = [
  {
    id: 'c1',
    name: 'Alex Rivera',
    title: 'Senior Cloud Architect',
    location: 'Austin, TX',
    available: true,
    travelWillingness: 'Domestic',
    careerGoal: 'Grow into Cloud Practice Lead',
    skills: {
      'Cloud Architecture': 'Expert',
      'DevOps / CI-CD': 'Proficient',
      'Solution Architecture': 'Expert',
      'Cybersecurity': 'Beginner',
      'Data Engineering': 'Beginner',
      'Machine Learning / AI': 'None',
      'Generative AI': 'Beginner',
      'Integration / APIs': 'Proficient',
    },
    certifications: ['AWS Solutions Architect Professional', 'CKA', 'Azure Fundamentals'],
    industries: ['Financial Services', 'Retail'],
    platforms: ['AWS', 'Azure', 'GCP'],
    yearsExp: 9,
    utilizationPct: 20,
    hourlyRate: 175,
    caseCount: 18,
  },
  {
    id: 'c2',
    name: 'Jordan Kim',
    title: 'Data & AI Engineer',
    location: 'Chicago, IL',
    available: false,
    travelWillingness: 'Remote Only',
    careerGoal: 'Specialize in Generative AI productionization',
    skills: {
      'Data Engineering': 'Expert',
      'Machine Learning / AI': 'Expert',
      'Generative AI': 'Proficient',
      'Analytics & BI': 'Proficient',
      'Cloud Architecture': 'Proficient',
      'DevOps / CI-CD': 'Beginner',
      'Solution Architecture': 'Beginner',
      'Cybersecurity': 'None',
    },
    certifications: ['Google Professional Data Engineer', 'Databricks Certified Associate'],
    industries: ['Healthcare', 'Financial Services'],
    platforms: ['GCP', 'Snowflake', 'Databricks', 'OpenAI / Azure OpenAI'],
    yearsExp: 7,
    utilizationPct: 95,
    hourlyRate: 165,
    caseCount: 12,
  },
  {
    id: 'c3',
    name: 'Morgan Lee',
    title: 'Change & Agile Lead',
    location: 'New York, NY',
    available: true,
    travelWillingness: 'Any',
    careerGoal: 'Lead enterprise-wide transformation programmes',
    skills: {
      'Change Management': 'Expert',
      'Agile / Scrum': 'Expert',
      'Project Management': 'Expert',
      'Business Analysis': 'Proficient',
      'UI / UX Design': 'Beginner',
      'Cloud Architecture': 'None',
      'Machine Learning / AI': 'None',
      'Generative AI': 'None',
    },
    certifications: ['PMP', 'SAFe 6 Agilist', 'Prosci ADKAR'],
    industries: ['Government', 'Telco', 'Manufacturing'],
    platforms: ['ServiceNow'],
    yearsExp: 11,
    utilizationPct: 40,
    hourlyRate: 155,
    caseCount: 23,
  },
  {
    id: 'c4',
    name: 'Sam Patel',
    title: 'Security & Compliance Architect',
    location: 'Washington DC',
    available: true,
    travelWillingness: 'Domestic',
    careerGoal: 'Build a cloud security practice',
    skills: {
      'Cybersecurity': 'Expert',
      'Cloud Architecture': 'Proficient',
      'Solution Architecture': 'Proficient',
      'Integration / APIs': 'Beginner',
      'DevOps / CI-CD': 'Beginner',
      'Machine Learning / AI': 'None',
      'Generative AI': 'None',
      'Data Engineering': 'None',
    },
    certifications: ['CISSP', 'AWS Security Specialty', 'FedRAMP Practitioner'],
    industries: ['Government', 'Financial Services'],
    platforms: ['AWS', 'Azure'],
    yearsExp: 13,
    utilizationPct: 50,
    hourlyRate: 190,
    caseCount: 15,
  },
  {
    id: 'c5',
    name: 'Taylor Nguyen',
    title: 'GenAI & Product Designer',
    location: 'San Francisco, CA',
    available: true,
    travelWillingness: 'Limited',
    careerGoal: 'Build AI-native product experiences',
    skills: {
      'Generative AI': 'Expert',
      'UI / UX Design': 'Expert',
      'Machine Learning / AI': 'Proficient',
      'Business Analysis': 'Proficient',
      'Agile / Scrum': 'Proficient',
      'Analytics & BI': 'Beginner',
      'Cloud Architecture': 'None',
      'Cybersecurity': 'None',
    },
    certifications: ['Google Cloud Professional ML Engineer', 'Nielsen Norman UX Certified'],
    industries: ['Retail', 'Healthcare', 'Professional Services'],
    platforms: ['OpenAI / Azure OpenAI', 'Google Vertex AI', 'GCP'],
    yearsExp: 6,
    utilizationPct: 30,
    hourlyRate: 160,
    caseCount: 9,
  },
  {
    id: 'c6',
    name: 'Casey Okafor',
    title: 'Enterprise Integration Lead',
    location: 'Dallas, TX',
    available: false,
    travelWillingness: 'Domestic',
    careerGoal: 'Become a Principal Integration Architect',
    skills: {
      'Integration / APIs': 'Expert',
      'Solution Architecture': 'Expert',
      'Cloud Architecture': 'Proficient',
      'DevOps / CI-CD': 'Proficient',
      'Data Engineering': 'Proficient',
      'Cybersecurity': 'Beginner',
      'Generative AI': 'Beginner',
      'Machine Learning / AI': 'None',
    },
    certifications: ['MuleSoft Certified Developer', 'Azure Integration Engineer', 'AWS Certified Developer'],
    industries: ['Energy', 'Manufacturing', 'Telco'],
    platforms: ['AWS', 'Azure', 'SAP'],
    yearsExp: 10,
    utilizationPct: 90,
    hourlyRate: 170,
    caseCount: 20,
  },
  {
    id: 'c7',
    name: 'Riley Santos',
    title: 'Analytics & BI Specialist',
    location: 'Atlanta, GA',
    available: true,
    travelWillingness: 'Any',
    careerGoal: 'Lead analytics centre of excellence',
    skills: {
      'Analytics & BI': 'Expert',
      'Data Engineering': 'Proficient',
      'Machine Learning / AI': 'Beginner',
      'Business Analysis': 'Proficient',
      'Agile / Scrum': 'Beginner',
      'Cloud Architecture': 'None',
      'Cybersecurity': 'None',
      'Generative AI': 'None',
    },
    certifications: ['Microsoft Power BI Certified', 'Tableau Desktop Specialist', 'Snowflake SnowPro Core'],
    industries: ['Retail', 'Energy', 'Professional Services'],
    platforms: ['Snowflake', 'Databricks', 'Azure'],
    yearsExp: 8,
    utilizationPct: 60,
    hourlyRate: 145,
    caseCount: 14,
  },
  {
    id: 'c8',
    name: 'Drew Marchetti',
    title: 'Cloud & DevOps Engineer',
    location: 'Seattle, WA',
    available: false,
    travelWillingness: 'Remote Only',
    careerGoal: 'Platform Engineering leadership',
    skills: {
      'DevOps / CI-CD': 'Expert',
      'Cloud Architecture': 'Expert',
      'Integration / APIs': 'Proficient',
      'Cybersecurity': 'Proficient',
      'Data Engineering': 'Beginner',
      'Machine Learning / AI': 'None',
      'Generative AI': 'None',
      'Change Management': 'None',
    },
    certifications: ['CKA', 'Terraform Associate', 'AWS DevOps Professional'],
    industries: ['Telco', 'Retail'],
    platforms: ['AWS', 'GCP', 'Azure'],
    yearsExp: 7,
    utilizationPct: 100,
    hourlyRate: 158,
    caseCount: 11,
  },
]

// ── Pursuits ──────────────────────────────────────────────────────────

export const PURSUITS: Pursuit[] = [
  {
    id: 'p1',
    name: 'CloudFirst Modernisation',
    client: 'Apex Financial Group',
    status: 'Active',
    requiredSkills: ['Cloud Architecture', 'DevOps / CI-CD', 'Cybersecurity', 'Change Management'],
    industry: 'Financial Services',
    platform: 'AWS',
    startDate: '2025-01-06',
    endDate: '2025-09-30',
    teamSize: 5,
    assignedConsultants: ['c1', 'c3', 'c8'],
  },
  {
    id: 'p2',
    name: 'AI Diagnostic Assistant',
    client: 'NovaMed Health',
    status: 'Active',
    requiredSkills: ['Machine Learning / AI', 'Generative AI', 'Data Engineering', 'UI / UX Design'],
    industry: 'Healthcare',
    platform: 'Azure',
    startDate: '2025-02-01',
    endDate: '2025-11-30',
    teamSize: 4,
    assignedConsultants: ['c2', 'c5'],
  },
  {
    id: 'p3',
    name: 'DataMesh Enterprise Rollout',
    client: 'Summit Energy Partners',
    status: 'Pursuit',
    requiredSkills: ['Data Engineering', 'Analytics & BI', 'Cloud Architecture', 'Integration / APIs'],
    industry: 'Energy',
    platform: 'Snowflake',
    startDate: '2025-05-01',
    endDate: '2025-12-31',
    teamSize: 6,
    assignedConsultants: ['c7'],
  },
  {
    id: 'p4',
    name: 'Citizen Services Portal',
    client: 'State Digital Office',
    status: 'Pursuit',
    requiredSkills: ['Solution Architecture', 'Cybersecurity', 'Agile / Scrum', 'Change Management', 'Integration / APIs'],
    industry: 'Government',
    platform: 'Azure',
    startDate: '2025-06-01',
    endDate: '2026-05-31',
    teamSize: 8,
    assignedConsultants: ['c4', 'c3'],
  },
  {
    id: 'p5',
    name: 'GenAI Customer Co-pilot',
    client: 'RetailMax Corp',
    status: 'Pursuit',
    requiredSkills: ['Generative AI', 'Machine Learning / AI', 'UI / UX Design', 'Business Analysis'],
    industry: 'Retail',
    platform: 'OpenAI / Azure OpenAI',
    startDate: '2025-07-01',
    endDate: '2025-12-31',
    teamSize: 4,
    assignedConsultants: ['c5'],
  },
]

// ── Role definitions used in the Pod Configurator ─────────────────────

export interface RoleTemplate {
  title: string
  skills: string[]
  seniorityOptions: ('Junior' | 'Mid' | 'Senior' | 'Principal')[]
  baseRateRange: [number, number]   // per hour
  fteEquivalent: number             // fraction of a FTE
}

export const ROLE_TEMPLATES: RoleTemplate[] = [
  {
    title: 'Engagement Lead',
    skills: ['Project Management', 'Agile / Scrum', 'Change Management'],
    seniorityOptions: ['Senior', 'Principal'],
    baseRateRange: [180, 260],
    fteEquivalent: 0.5,
  },
  {
    title: 'Solution Architect',
    skills: ['Solution Architecture', 'Cloud Architecture', 'Integration / APIs'],
    seniorityOptions: ['Senior', 'Principal'],
    baseRateRange: [160, 230],
    fteEquivalent: 1,
  },
  {
    title: 'Cloud / DevOps Engineer',
    skills: ['Cloud Architecture', 'DevOps / CI-CD'],
    seniorityOptions: ['Mid', 'Senior'],
    baseRateRange: [130, 180],
    fteEquivalent: 1,
  },
  {
    title: 'Data Engineer',
    skills: ['Data Engineering', 'Analytics & BI'],
    seniorityOptions: ['Mid', 'Senior'],
    baseRateRange: [130, 170],
    fteEquivalent: 1,
  },
  {
    title: 'AI / ML Engineer',
    skills: ['Machine Learning / AI', 'Generative AI', 'Data Engineering'],
    seniorityOptions: ['Mid', 'Senior', 'Principal'],
    baseRateRange: [145, 210],
    fteEquivalent: 1,
  },
  {
    title: 'Cybersecurity Specialist',
    skills: ['Cybersecurity', 'Cloud Architecture'],
    seniorityOptions: ['Mid', 'Senior'],
    baseRateRange: [140, 195],
    fteEquivalent: 0.5,
  },
  {
    title: 'Change & Adoption Manager',
    skills: ['Change Management', 'Agile / Scrum', 'Business Analysis'],
    seniorityOptions: ['Mid', 'Senior'],
    baseRateRange: [125, 165],
    fteEquivalent: 0.5,
  },
  {
    title: 'UX / Product Designer',
    skills: ['UI / UX Design', 'Business Analysis'],
    seniorityOptions: ['Mid', 'Senior'],
    baseRateRange: [120, 160],
    fteEquivalent: 0.5,
  },
  {
    title: 'Business / Systems Analyst',
    skills: ['Business Analysis', 'Integration / APIs'],
    seniorityOptions: ['Junior', 'Mid'],
    baseRateRange: [90, 130],
    fteEquivalent: 1,
  },
]
