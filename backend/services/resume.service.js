const pdfParse = require('pdf-parse');
const resumeParserService = require('./resumeParser.service');
const atsScoringService = require('./atsScoring.service');

async function extractTextFromPDF(buffer) {
  const data = await pdfParse(buffer);
  return data.text;
}

async function processResume(buffer) {
  const rawText = await extractTextFromPDF(buffer);

  const parsedResume =
    resumeParserService.parseResume(rawText);

  const atsAnalysis =
    atsScoringService.calculateATSScore(parsedResume);

  return {
    parsedResume,
    atsAnalysis
  };
}

module.exports = {
  extractTextFromPDF,
  processResume
};
