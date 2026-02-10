/**
 * Smart Suggestion Engine
 */

function generateSuggestions({ missingSkills = [], atsBreakdown = {}, redFlags = [] }) {

  const suggestions = [];

  // Suggest missing skills dynamically
  missingSkills.forEach(skill => {
    suggestions.push(`Consider adding "${skill}" if you have worked with it.`);
  });

  // ATS Based Suggestions
  if (atsBreakdown.sectionCompleteness < 80) {
    suggestions.push('Add missing resume sections like education, projects, or experience.');
  }

  if (atsBreakdown.impactScore < 70) {
    suggestions.push('Add more measurable results (%, growth, scale, metrics).');
  }

  if (atsBreakdown.skillStrength < 70) {
    suggestions.push('Expand your technical skill section with relevant tools.');
  }

  if (atsBreakdown.experienceConsistency < 60) {
    suggestions.push('Structure experience with role titles and clear outcomes.');
  }

  // Red flag suggestions
  redFlags.forEach(flag => {
    suggestions.push(`Fix issue: ${flag}`);
  });

  return [...new Set(suggestions)];
}

module.exports = { generateSuggestions };
