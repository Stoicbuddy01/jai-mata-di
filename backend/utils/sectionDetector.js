/**
 * Section Detector Utility
 */

const { calculateSimilarity } = require('./fuzzyMatcher');
const { SECTION_KEYWORDS } = require('./sectionKeywords');

function normalizeSectionHeader(text) {
  if (!text || typeof text !== 'string') return '';
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function tryExactMatch(normalizedHeader) {
  for (const [sectionName, keywords] of Object.entries(SECTION_KEYWORDS)) {
    if (keywords.some(keyword => normalizedHeader.includes(keyword))) {
      return sectionName;
    }
  }
  return null;
}

function tryFuzzyMatch(normalizedHeader, similarityThreshold = 0.75) {
  let bestMatchSection = null;
  let bestScore = similarityThreshold;

  for (const [sectionName, keywords] of Object.entries(SECTION_KEYWORDS)) {
    for (const keyword of keywords) {
      const score = calculateSimilarity(normalizedHeader, keyword);
      if (score > bestScore) {
        bestScore = score;
        bestMatchSection = sectionName;
      }
    }
  }
  return bestMatchSection;
}

function detectSection(line) {
  if (!line || line.length < 3) {
    return null;
  }

  const normalized = normalizeSectionHeader(line);
  const exactMatch = tryExactMatch(normalized);
  if (exactMatch) {
    return exactMatch;
  }

  const fuzzyMatch = tryFuzzyMatch(normalized);
  if (fuzzyMatch) {
    return fuzzyMatch;
  }

  return null;
}

module.exports = {
  detectSection,
  normalizeSectionHeader,
  tryExactMatch,
  tryFuzzyMatch
};
