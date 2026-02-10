// Comprehensive stopword list - common English words that aren't technical skills
const STOPWORDS = new Set([
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'but', 'by', 'for', 'from',
  'have', 'he', 'her', 'his', 'how', 'i', 'if', 'in', 'into', 'is', 'it',
  'its', 'of', 'on', 'or', 'that', 'the', 'this', 'to', 'was', 'we', 'with',
  'you', 'your', 'should', 'would', 'could', 'will', 'do', 'does', 'did',
  'has', 'had', 'can', 'may', 'must', 'shall', 'should', 'will', 'being',
  'am', 'been', 'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will',
  'would', 'could', 'should', 'may', 'might', 'must', 'shall', 'looking',
  'seeking', 'required', 'required', 'must', 'should', 'preferred', 'nice',
  'have', 'know', 'understand', 'develop', 'build', 'work', 'experience',
  'years', 'year', 'months', 'month', 'about', 'more', 'plus', 'like',
  'such', 'than', 'then', 'them', 'their', 'there', 'these', 'those',
  'what', 'when', 'where', 'which', 'while', 'who', 'whom', 'why', 'up',
  'also', 'only', 'very', 'just', 'some', 'any', 'all', 'each', 'every',
  'both', 'either', 'neither', 'not', 'no', 'nor', 'so', 'too', 'own',
  'same', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than',
  'too', 'very', 'just', 'ability', 'skills', 'skill', 'experience', 'background',
  'knowledge', 'understanding', 'proficiency', 'expertise', 'familiarity', 'prefer',
  'ideal', 'candidate', 'person', 'team', 'teams', 'member', 'role', 'position',
  'job', 'work', 'tasks', 'task', 'responsibilities', 'responsible', 'ability',
  'strong', 'excellent', 'good', 'best', 'well', 'better', 'proven', 'demonstrated',
  'ability', 'capable', 'competent', 'solid', 'sound', 'thorough', 'comprehensive',
  'best', 'better', 'good', 'great', 'excellent', 'outstanding', 'top', 'senior',
  'junior', 'mid', 'level', 'plus', 'advantage', 'bonus', 'edge', 'preferred'
]);

// Known framework stacks with their components
const FRAMEWORK_STACKS = {
  mern: ['mongodb', 'express', 'react', 'node'],
  mean: ['mongodb', 'express', 'angular', 'node'],
  lamp: ['linux', 'apache', 'mysql', 'php'],
  mevn: ['mongodb', 'express', 'vue', 'node'],
  jam: ['javascript', 'apis', 'markup']
};

// Common framework keywords derived from known technologies
const FRAMEWORK_KEYWORDS = new Set([
  'react', 'angular', 'vue', 'svelte', 'ember', 'backbone',
  'node', 'express', 'django', 'flask', 'spring', 'laravel',
  'mongodb', 'postgres', 'mysql', 'redis', 'cassandra', 'elasticsearch',
  'docker', 'kubernetes', 'jenkins', 'gitlab', 'github', 'aws', 'azure', 'gcp',
  'javascript', 'typescript', 'python', 'java', 'csharp', 'go', 'rust', 'php',
  'html', 'css', 'scss', 'sass', 'webpack', 'babel', 'eslint', 'prettier',
  'git', 'rest', 'graphql', 'sql', 'nosql', 'orm', 'api', 'websocket',
  'testing', 'jest', 'mocha', 'karma', 'cypress', 'selenium', 'junit',
  'agile', 'scrum', 'kanban', 'ci', 'cd', 'devops', 'microservices',
  'react.js', 'next.js', 'nuxt.js', 'gatsby', 'gridsome', 'vuepress'
]);

/**
 * Normalize a string for comparison
 * - Lowercase
 * - Remove leading/trailing whitespace
 * - Keep dots for framework names (React.js vs reactjs)
 */
function normalize(text) {
  if (!text || typeof text !== 'string') return '';
  return text
    .toLowerCase()
    .trim();
}

/**
 * Normalize for matching (more aggressive)
 * - Lowercase
 * - Remove dots
 * - Remove hyphens
 * - No spaces
 */
function normalizeForMatching(text) {
  if (!text || typeof text !== 'string') return '';
  return text
    .toLowerCase()
    .replace(/[.\-_\s]/g, '')
    .trim();
}

/**
 * Extract resume skills with normalization
 * Only includes actual skills from resume
 */
function extractResumeSkills(resume) {
  if (!resume || !Array.isArray(resume.skills)) return [];

  return Array.from(new Set(
    resume.skills
      .map(s => normalize(s))
      .filter(s => s.length > 0)
  ));
}

/**
 * Tokenize job description intelligently
 * - Split by common separators and whitespace
 * - Remove stopwords
 * - Keep only tokens > 2 characters
 * - Remove duplicates
 */
function tokenizeJobDescription(jdText) {
  if (!jdText || typeof jdText !== 'string') return [];

  // Split by common separators and whitespace
  const tokens = jdText
    .toLowerCase()
    .split(/[\s,;:\n\|\/\\•·–—\(\)\[\]\{\}]+/)
    .map(t => t.trim())
    .filter(t => t.length > 2) // Only tokens > 2 chars
    .filter(t => !STOPWORDS.has(t)) // Remove stopwords
    .filter(t => t); // Remove empty strings

  return Array.from(new Set(tokens));
}

/**
 * Expand framework stack terms
 * If JD contains "MERN", expand to individual components
 */
function expandFrameworkStacks(tokens) {
  const expanded = new Set(tokens);

  for (const token of tokens) {
    const normalized = normalizeForMatching(token);
    if (FRAMEWORK_STACKS[normalized]) {
      FRAMEWORK_STACKS[normalized].forEach(component => expanded.add(component));
    }
  }

  return Array.from(expanded);
}

/**
 * Build a dynamic knowledge base of technical terms
 * from resume and known frameworks
 */
function buildTechnicalKeywordBase(resumeSkills) {
  const base = new Set(FRAMEWORK_KEYWORDS);

  // Add normalized resume skills
  resumeSkills.forEach(skill => {
    base.add(normalizeForMatching(skill));
    base.add(normalize(skill));
  });

  return base;
}

/**
 * Check if a token is a technical term
 * by comparing against known frameworks and resume skills
 */
function isTechnicalTerm(token, technicalBase) {
  const normalized = normalizeForMatching(token);
  const directMatch = normalizeForMatching(token);

  // Check against technical keyword base
  return technicalBase.has(normalized) ||
         technicalBase.has(token) ||
         technicalBase.has(normalize(token));
}

/**
 * Check if resume already has a skill (with flexible matching)
 */
function hasSkill(jdTerm, resumeSkills) {
  const normalizedJD = normalizeForMatching(jdTerm);

  return resumeSkills.some(skill => {
    const normalizedSkill = normalizeForMatching(skill);

    // Exact match after normalization
    if (normalizedSkill === normalizedJD) {
      return true;
    }

    // Substring matches (e.g., "react" in "react.js")
    if (normalizedSkill.includes(normalizedJD) ||
        normalizedJD.includes(normalizedSkill)) {
      return true;
    }

    return false;
  });
}

/**
 * Main matching function
 * Computes match percentage and identifies missing skills
 */
function computeMatch(parsedResume, jobDescription) {
  if (!parsedResume || !jobDescription) {
    throw new Error('Resume and job description are required');
  }

  // Extract and normalize resume skills
  const resumeSkills = extractResumeSkills(parsedResume);

  // Tokenize job description (removes stopwords)
  let jdTokens = tokenizeJobDescription(jobDescription);

  // Expand framework stacks (MERN → mongodb, express, react, node)
  jdTokens = expandFrameworkStacks(jdTokens);

  // Build technical knowledge base
  const technicalBase = buildTechnicalKeywordBase(resumeSkills);

  // Filter to only technical terms
  const technicalJDTerms = jdTokens.filter(token =>
    isTechnicalTerm(token, technicalBase)
  );

  // Find matched skills
  const matchedSkills = technicalJDTerms.filter(jdTerm =>
    hasSkill(jdTerm, resumeSkills)
  );

  // Find missing skills
  const missingSkills = Array.from(new Set(
    technicalJDTerms.filter(jdTerm =>
      !hasSkill(jdTerm, resumeSkills)
    )
  ));

  // Calculate match percentage
  const totalTechnicalTerms = technicalJDTerms.length;
  const covered = matchedSkills.length;

  const matchPercentage = totalTechnicalTerms > 0
    ? Math.round((covered / totalTechnicalTerms) * 100)
    : 100;

  return {
    matchPercentage,
    matchedSkills: Array.from(new Set(matchedSkills)),
    missingSkills,
    keywordMatchScore: matchPercentage
  };
}

module.exports = {
  computeMatch
};
