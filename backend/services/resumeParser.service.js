/**
 * Resume Parser Service
 * Extracts structured data from resume text
 *
 * Main tasks:
 * 1. Extract contact info (name, email, phone)
 * 2. Extract skills (from labeled sections)
 * 3. Extract resume sections (education, experience, projects, achievements)
 */

const { detectSection } = require('../utils/sectionDetector');

/**
 * Extract contact information from resume text
 */
function extractContactInfo(text) {
  const contactInfo = {
    name: '',
    email: '',
    phone: ''
  };

  // First line is typically the name
  const firstLine = text.split('\n')[0]?.trim() || '';
  contactInfo.name = firstLine;

  // Email pattern: simple alphanumeric@domain.extension
  const emailMatch = text.match(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i);
  contactInfo.email = emailMatch ? emailMatch[0] : '';

  // Phone pattern: + optional, digits with spaces/dashes, at least 8 more digits
  const phoneMatch = text.match(/(\+?\d[\d\s-]{8,}\d)/);
  contactInfo.phone = phoneMatch ? phoneMatch[0] : '';

  return contactInfo;
}

/**
 * Extract skills from labeled skill sections
 * Looks for patterns like "Languages: JS, Python" or "Tools: Git, Docker"
 */
function extractSkills(lines) {
  const skillPatterns = [
    /Languages\s*:\s*(.+)/i,
    /Frameworks\s*:\s*(.+)/i,
    /Tools\s*:\s*(.+)/i,
    /Databases?\s*(?:& ?ORMs?)?\s*:\s*(.+)/i,
    /Technologies\s*:\s*(.+)/i,
    /Tech Stack\s*:\s*(.+)/i,
    /Skills\s*:\s*(.+)/i,
    /Competencies\s*:\s*(.+)/i
  ];

  const skills = [];

  for (const line of lines) {
    for (const pattern of skillPatterns) {
      const match = line.match(pattern);
      if (match && match[1]) {
        // Split by comma and clean up
        const extracted = match[1]
          .split(',')
          .map(skill => skill.trim())
          .filter(s => s.length > 0);

        skills.push(...extracted);
      }
    }
  }

  // Remove duplicates
  return [...new Set(skills)];
}

/**
 * Extract resume sections (education, experience, projects, achievements)
 * Detects section headers and groups content under each section
 */
function extractSections(lines) {
  const sections = {
    education: [],
    experience: [],
    projects: [],
    achievements: [],
    skills: []
  };

  let currentSection = '';

  for (const line of lines) {
    // Try to detect if this is a section header
    const detectedSection = detectSection(line);

    if (detectedSection) {
      // Found a new section header
      currentSection = detectedSection;
      console.log(`\n[Parser] Starting section: ${detectedSection}`);
      continue;
    }

    // Add content to current section if we're in one
    if (currentSection && line.length > 3) {
      sections[currentSection].push(line);
      console.log(`[Content] Added to ${currentSection}: "${line.substring(0, 50)}..."`);
    }
  }

  return sections;
}

/**
 * Main parse function
 * Orchestrates all extraction tasks
 */
function parseResume(text) {
  if (!text || typeof text !== 'string') {
    throw new Error('Resume text is required');
  }

  console.log('\n=== RESUME PARSING STARTED ===\n');

  // Split into lines
  const lines = text
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean);

  console.log(`[Parser] Total lines: ${lines.length}`);

  // 1. Extract contact info
  const contactInfo = extractContactInfo(text);
  console.log(`[Parser] Name: ${contactInfo.name}`);
  console.log(`[Parser] Email: ${contactInfo.email}`);
  console.log(`[Parser] Phone: ${contactInfo.phone}`);

  // 2. Extract skills
  const skills = extractSkills(lines);
  console.log(`\n[Parser] Found ${skills.length} skills`);

  // 3. Extract sections
  const sections = extractSections(lines);
  console.log(`\n[Parser] Section Summary:`);
  console.log(`  - Education: ${sections.education.length} lines`);
  console.log(`  - Experience: ${sections.experience.length} lines`);
  console.log(`  - Projects: ${sections.projects.length} lines`);
  console.log(`  - Achievements: ${sections.achievements.length} lines`);

  // Build final structured object
  const structured = {
    name: contactInfo.name,
    email: contactInfo.email,
    phone: contactInfo.phone,
    skills: [...new Set(skills)],
    education: sections.education,
    experience: sections.experience,
    projects: sections.projects,
    achievements: sections.achievements
  };

  console.log('\n=== RESUME PARSING COMPLETED ===\n');

  return structured;
}

module.exports = {
  parseResume
};
