export const site = {
  name: "Kai Le",
  role: "Software Engineer",
  specialty: "System Design / Technical Leadership",
  location: "Ho Chi Minh City, Vietnam",
  email: "lenguyenkhai2611@gmail.com",
  github: "https://github.com/nobug1312",
  linkedin: "https://www.linkedin.com/in/le-kai",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? (
    process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : "http://localhost:3000"
  ),
  tagline: "Code that reaches beyond the screen.",
  intro: "I bring clarity to complex engineering problems. I trace issues to their roots, weigh trade-offs carefully, and build with long-term maintainability in mind. I take ownership of technical decisions and help teams build with confidence.",
  description:
    "Kai Le is a software engineer focused on .NET, full-stack development, system architecture and reliable production systems.",
};

export const nav = [
  { id: "skills", label: "Skills", mobile: true },
  { id: "projects", label: "Projects", mobile: true },
  { id: "experience", label: "Experience", mobile: false },
  { id: "contact", label: "Contact", mobile: true },
];

export const about = site.intro;

export const skills = [
  { title: "Languages", items: ["C#", "TypeScript", "JavaScript", "Java"] },
  { title: "Backend", items: [".NET", "Node.js", "GraphQL", "RabbitMQ"] },
  { title: "Frontend", items: ["React", "Redux", "AngularJS"] },
  { title: "Databases", items: ["SQL Server", "PostgreSQL", "MySQL", "MongoDB", "Redis"] },
  { title: "Cloud & DevOps", items: ["AWS", "Azure DevOps", "Docker", "Jenkins", "GitHub Actions"] },
  { title: "Tools", items: ["Git", "GitHub", "GitLab", "Postman", "Figma"] },
  { title: "Operating Systems", items: ["Windows", "Linux", "macOS"] },
  { title: "Engineering", items: ["System Architecture", "Distributed Systems", "Manufacturing Software", "Geometry Processing", "Technical Leadership", "Mentoring", "Code Reviews"] },
];

type Role = {
  when: string;
  title: string;
  org?: string;
  team?: string;
  summary: string;
  points?: string[];
};

export const experience: Role[] = [
  {
    when: "Sep 2025 - Present",
    title: "Senior Software Engineer",
    org: "MiTek",
    summary: "Core production systems for North American structural fabrication workflows.",
    points: [
      "Redesigned geometry and conversion algorithms to improve output accuracy and reduce recurring production defects.",
      "Led cross-system root cause analysis and improved architecture, maintainability and internal debugging tools.",
      "Drove technical decisions and raised engineering standards through architecture reviews, mentoring and organization-wide knowledge sharing.",
    ],
  },
  {
    when: "Aug 2022 - Sep 2025",
    title: "Software Engineer",
    org: "PTN Global Corp",
    summary: "Full-stack development of real-time language products for international clients.",
    points: [
      "Designed backend services and the data model for a live caption translation platform.",
      "Redesigned the delivery workflow with my team lead, cutting time to ship features by 40%.",
      "Built a real-time transcription pipeline for a meeting bot across Zoom, Teams, Meet, and Webex.",
    ],
  },
  {
    when: "Jul 2017 - May 2022",
    title: "B.Sc. Information Systems",
    org: "Can Tho University",
    summary: "Top 3 in the entrance exam. Merit scholarship recipient.",
  },
];

export const certificates = [
  { name: "Japanese N4", date: "Apr 2022" },
  { name: "iOS & Swift App Development Bootcamp", date: "May 2023" },
];

type Project = {
  name: string;
  org: string;
  kind: string;
  summary: string;
  contribution: string;
  outcome: string;
  tech: string[];
};

export const projects: Project[] = [
  {
    name: "Structural Fabrication Engine",
    org: "MiTek",
    kind: "Senior Software Engineer / Team of 5",
    summary: "A manufacturing system that converts structural building models into machine-ready fabrication data for residential and commercial construction across North America.",
    contribution: "Owned member conversion, plate generation and bevel/miter calculations. Redesigned legacy geometry algorithms, led investigations across design, management and manufacturing systems, and improved debugging tools and code quality.",
    outcome: "Improved manufacturing accuracy, reliability and data consistency, reducing defects and rework risks. Supported scalable fabrication workflows and strengthened team effectiveness through mentoring and knowledge sharing.",
    tech: ["WPF", "C#", "Azure DevOps", "3D computational geometry"],
  },
  {
    name: "CaptionConnectLive",
    org: "PTN Global Corp",
    kind: "Software Engineer / Team of 12",
    summary: "A live-session platform delivering translated captions to multilingual audiences.",
    contribution: "Designed the UI, database schema and real-time backend services; integrated secure subscription payments.",
    outcome: "Improved the team workflow with the team lead, cutting new-feature deployment time by 40% and reducing configuration-related bugs.",
    tech: ["Real-time translation", "Database design", "Payments"],
  },
  {
    name: "Bot App Meeting Assistant",
    org: "PTN Global Corp",
    kind: "Software Engineer / Team of 5",
    summary: "A meeting assistant for Webex, Google Meet, Teams and Zoom, with real-time transcription and speaker identification.",
    contribution: "Engineered the transcription and translation pipeline and scalable architecture across meeting platforms.",
    outcome: "Reduced system latency and improved translation response times for cross-language collaboration.",
    tech: ["Transcription", "Translation", "System architecture"],
  },
  {
    name: "CCLV3 Desktop App",
    org: "PTN Global Corp",
    kind: "Software Engineer / Team of 5",
    summary: "An offline desktop app for meeting transcription, translation and session playback.",
    contribution: "Led cross-platform UI design and development in WPF and .NET MAUI, defining recording, transcript review and playback workflows. Integrated offline speech and translation models and optimized large-audio processing.",
    outcome: "Established a cohesive, accessible cross-platform experience for non-technical users, while improving memory efficiency and processing speed for large audio files.",
    tech: ["WPF", ".NET MAUI", "Offline speech recognition"],
  },
  {
    name: "Oncall Marketplace",
    org: "PTN Global Corp",
    kind: "Software Engineer / Team of 5",
    summary: "A video-localization platform with editable transcripts, multilingual subtitles and export.",
    contribution: "Built responsive editing interfaces, connected microservices through Ocelot, and orchestrated jobs with RabbitMQ and Hangfire.",
    outcome: "Streamlined transcription and translation workflows for content creators and businesses.",
    tech: ["Ocelot API Gateway", "RabbitMQ", "Hangfire"],
  },
];
