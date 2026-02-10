/**
 * Advanced ATS Scoring Engine
 * Fully dynamic and logical
 */

function calculateATSScore(parsedResume) {
  if (!parsedResume) {
    throw new Error('Parsed resume is required');
  }

  const breakdown = {
    sectionCompleteness: 0,
    impactScore: 0,
    skillStrength: 0,
    experienceConsistency: 0,
    formattingScore: 0,
    lengthOptimization: 0
  };

  const redFlags = [];

  // ------------------------------
  // 1. Section Completeness
  // ------------------------------
  const requiredSections = [
    'skills',
    'education',
    'projects',
    'experience'
  ];

  const filledSections = requiredSections.filter(section =>
    Array.isArray(parsedResume[section]) &&
    parsedResume[section].length > 0
  ).length;

  breakdown.sectionCompleteness =
    Math.round((filledSections / requiredSections.length) * 100);

  if (filledSections < requiredSections.length) {
    redFlags.push('Some important sections are missing.');
  }

  // ------------------------------
  // 2. Skill Strength (scaled)
  // ------------------------------
  const skillCount = parsedResume.skills?.length || 0;

  breakdown.skillStrength = Math.min(100, skillCount * 10);

  if (skillCount < 5) {
    redFlags.push('Low number of listed skills.');
  }

  // ------------------------------
  // 3. Impact Score (strong regex)
  // ------------------------------
  const text = JSON.stringify(parsedResume);

  const metricRegex =
    /\b(\d+%|\d+\s?(users?|clients?|projects?|teams?|hours?|days?|months?|years?)|\b\d+\.\d+\b)/gi;

  const metricMatches = text.match(metricRegex);

  const metricCount = metricMatches ? metricMatches.length : 0;

  breakdown.impactScore = Math.min(100, metricCount * 12);

  if (metricCount < 3) {
    redFlags.push('Very few measurable achievements detected.');
  }

  // ------------------------------
  // 4. Experience Consistency
  // ------------------------------
  const experienceLines = parsedResume.experience || [];

  const structuredEntries = experienceLines.filter(line =>
    /\b(intern|developer|engineer|lead|manager|internship)\b/i.test(line)
  ).length;

  breakdown.experienceConsistency =
    experienceLines.length > 5
      ? Math.min(100, structuredEntries * 20)
      : 40;

  if (experienceLines.length === 0) {
    redFlags.push('No experience section found.');
  }

  // ------------------------------
  // 5. Formatting Score
  // ------------------------------
  const totalLines =
    (parsedResume.education?.length || 0) +
    (parsedResume.projects?.length || 0) +
    (parsedResume.experience?.length || 0);

  breakdown.formattingScore =
    totalLines > 15 ? 85 :
    totalLines > 8 ? 70 :
    50;

  // ------------------------------
  // 6. Length Optimization
  // ------------------------------
  const totalContentLength = JSON.stringify(parsedResume).length;

  if (totalContentLength < 1500) {
    breakdown.lengthOptimization = 60;
    redFlags.push('Resume may be too short.');
  } else if (totalContentLength > 8000) {
    breakdown.lengthOptimization = 60;
    redFlags.push('Resume may be too long.');
  } else {
    breakdown.lengthOptimization = 100;
  }

  // ------------------------------
  // Final Weighted Score
  // ------------------------------
  const overallScore = Math.round(
    (breakdown.sectionCompleteness * 0.2) +
    (breakdown.skillStrength * 0.2) +
    (breakdown.impactScore * 0.2) +
    (breakdown.experienceConsistency * 0.15) +
    (breakdown.formattingScore * 0.15) +
    (breakdown.lengthOptimization * 0.1)
  );

  return {
    overallScore,
    breakdown,
    redFlags
  };
}

module.exports = {
  calculateATSScore
};
