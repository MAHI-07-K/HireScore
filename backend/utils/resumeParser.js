const knownSkills = [
  "javascript",
  "typescript",
  "react",
  "next.js",
  "node.js",
  "express",
  "mongodb",
  "mongoose",
  "python",
  "java",
  "c++",
  "sql",
  "postgresql",
  "mysql",
  "aws",
  "docker",
  "kubernetes",
  "git",
  "github",
  "tailwind",
  "html",
  "css",
  "rest api",
  "graphql",
  "machine learning",
  "llm",
];

const sectionMatchers = {
  skills: [
    /^skills?$/i,
    /^technical skills?$/i,
    /^core skills?$/i,
    /^technical expertise$/i,
  ],
  projects: [
    /^projects?$/i,
    /^academic projects?$/i,
    /^personal projects?$/i,
    /^selected projects?$/i,
  ],
  experience: [
    /^experience$/i,
    /^work experience$/i,
    /^professional experience$/i,
    /^internship$/i,
    /^internships$/i,
  ],
  achievements: [
    /^achievements?$/i,
    /^achievements and coding profile$/i,
    /^coding profile$/i,
    /^awards?$/i,
  ],
  certifications: [
    /^certifications?$/i,
    /^certificates?$/i,
    /^licenses? and certifications?$/i,
  ],
  education: [
    /^education$/i,
    /^academic background$/i,
  ],
  summary: [
    /^summary$/i,
    /^career objective$/i,
    /^objective$/i,
    /^profile$/i,
  ],
};

const allSectionKeys = Object.keys(sectionMatchers);

const normalizeLine = (line) =>
  String(line || "")
    .replace(/\u00a0/g, " ")
    .replace(/[|•]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const stripBulletPrefix = (line) =>
  line.replace(/^[-*•\u2022\d.)\s]+/, "").trim();

const unique = (items) => [...new Set(items.filter(Boolean))];

const extractGithubLinksFromLine = (line) => {
  const links = [];
  
  // Match full URLs with https:// or http://
  const fullUrlMatches = line.match(/https?:\/\/github\.com\/[^\s)>\]]+/gi) || [];
  links.push(...fullUrlMatches);
  
  // Match URLs without protocol (github.com/...)
  const noProtocolMatches = line.match(/github\.com\/[^\s)>\]]+/gi) || [];
  links.push(...noProtocolMatches.map((url) => `https://${url}`));
  
  // Clean up trailing punctuation and return unique links
  return [...new Set(links.map((link) => 
    link.replace(/[.,;)\]>]+$/, "").replace(/^https:\/\/(https?:\/\/)/, "$1")
  ))];
};

const detectSection = (line) => {
  const normalized = normalizeLine(line);

  for (const [section, matchers] of Object.entries(sectionMatchers)) {
    if (matchers.some((matcher) => matcher.test(normalized))) {
      return section;
    }
  }

  return null;
};

const collectSections = (text) => {
  const rawLines = text
    .split(/\r?\n/)
    .map(normalizeLine)
    .filter(Boolean);

  const sections = {};
  let currentSection = "header";

  for (const line of rawLines) {
    const detectedSection = detectSection(line);

    if (detectedSection) {
      currentSection = detectedSection;
      if (!sections[currentSection]) {
        sections[currentSection] = [];
      }
      continue;
    }

    if (!sections[currentSection]) {
      sections[currentSection] = [];
    }

    sections[currentSection].push(line);
  }

  return sections;
};

const extractSkills = (sections, lowerText) => {
  const skillsFromDictionary = knownSkills.filter((skill) =>
    lowerText.includes(skill)
  );

  const skillsFromSection = (sections.skills || [])
    .flatMap((line) => {
      const parts = line.includes(':') ? line.split(':').slice(1).join(',') : line;
      return parts.split(/[,/]/);
    })
    .map(stripBulletPrefix)
    .map((skill) => skill.trim().toLowerCase())
    .filter((skill) => skill.length > 1 && skill.length < 40);

  return unique([...skillsFromDictionary, ...skillsFromSection].map((skill) => skill.toLowerCase()));
};

const isLikelyProjectTitle = (line) => {
  const cleaned = stripBulletPrefix(line);

  if (!cleaned) return false;
  if (detectSection(cleaned)) return false;
  if (cleaned.length > 80) return false;
  if (/[.:]$/.test(cleaned)) return false;
  if (/^(developed|built|implemented|designed|created|worked|responsible|solved|achieved)\b/i.test(cleaned)) {
    return false;
  }

  const wordCount = cleaned.split(/\s+/).length;
  if (wordCount > 8) return false;

  return /^[A-Za-z0-9][A-Za-z0-9\s&()+\-/.]*$/.test(cleaned);
};

const extractProjects = (sections) => {
  const projectLines = sections.projects || [];
  const projects = [];
  let currentProject = null;

  for (const rawLine of projectLines) {
    const line = stripBulletPrefix(rawLine);
    if (!line) continue;

    if (allSectionKeys.includes(detectSection(line))) {
      break;
    }

    if (isLikelyProjectTitle(line)) {
      currentProject = {
        title: line,
        githubLinks: [],
      };
      projects.push(currentProject);
      continue;
    }

    if (!currentProject) {
      continue;
    }

    const githubLinks = extractGithubLinksFromLine(line);
    if (githubLinks.length) {
      currentProject.githubLinks.push(...githubLinks);
    }
  }

  return projects.map((project) => ({
    title: project.title,
    githubLinks: unique(project.githubLinks),
  }));
};

const extractCertifications = (sections) =>
  unique(
    (sections.certifications || [])
      .map(stripBulletPrefix)
      .filter((line) => line && !detectSection(line))
  );

export const parseResumeText = (text) => {
  const normalizedText = String(text || "");
  const lowerText = normalizedText.toLowerCase();
  const sections = collectSections(normalizedText);

  const extractedProjects = extractProjects(sections);
  const extractedCertifications = extractCertifications(sections);

  return {
    skills: extractSkills(sections, lowerText),
    projects: extractedProjects.map((project) => ({
      name: project.title,
      description: "",
      technologies: [],
      githubUrl: project.githubLinks?.[0] || "",
    })),
    certifications: extractedCertifications.map((cert) => ({
      name: cert,
      issuer: "",
      date: "",
    })),
  };
};
