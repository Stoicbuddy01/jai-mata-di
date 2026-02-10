const resumeService = require('../services/resume.service');
const jdMatchingService = require('../services/jdMatching.service');
const suggestionService = require('../services/suggestion.service');
const AppError = require('../utils/AppError');

/**
 * Upload Resume (ATS only)
 */
const uploadResume = async (req, res, next) => {
  try {
    if (!req.file) {
      return next(new AppError('No file uploaded', 400));
    }

    const result = await resumeService.processResume(req.file.buffer);

    res.status(200).json({
      success: true,
      data: result
    });

  } catch (error) {
    next(new AppError(error.message || 'Failed to process resume', 500));
  }
};


/**
 * JD Match only
 */
const matchResumeWithJD = async (req, res, next) => {
  try {
    const { parsedResume, jobDescription } = req.body;

    if (!parsedResume) {
      return next(new AppError('Parsed resume data is required', 400));
    }

    if (!jobDescription) {
      return next(new AppError('Job description is required', 400));
    }

    const matchResult = jdMatchingService.computeMatch(
      parsedResume,
      jobDescription
    );

    res.status(200).json({
      success: true,
      matchAnalysis: matchResult
    });

  } catch (error) {
    next(new AppError(error.message || 'Failed to match resume', 500));
  }
};


/**
 * Combined Analyze (ATS + JD + Optional AI)
 */
const analyzeResume = async (req, res, next) => {
  try {
    if (!req.file) {
      return next(new AppError('No file uploaded', 400));
    }

    const { jobDescription } = req.body;

    const result = await resumeService.processResume(req.file.buffer);

    const atsScore = result.atsAnalysis?.overallScore || 0;

    let jdMatchScore = null;
    let missingSkills = [];
    let finalOptimizationScore = atsScore;

    // ---------- JD Matching ----------
    if (jobDescription) {
      const matchResult = jdMatchingService.computeMatch(
        result.parsedResume,
        jobDescription
      );

      jdMatchScore = matchResult.matchPercentage;
      missingSkills = matchResult.missingSkills;

      finalOptimizationScore = Math.round(
        (atsScore * 0.6) + (jdMatchScore * 0.4)
      );
    }

    // ---------- Deterministic Suggestions ----------
    const atsBreakdown = result.atsAnalysis?.breakdown || {};
    const redFlags = result.atsAnalysis?.redFlags || [];


    const suggestions = suggestionService.generateSuggestions({
      missingSkills,
      atsBreakdown,
      redFlags
    });


    // ---------- Final Response ----------
    res.status(200).json({
      success: true,
      analysis: {
        atsScore,
        jdMatchScore,
        finalOptimizationScore,
        missingSkills,
        parsedResume: result.parsedResume,
        breakdown: atsBreakdown,
        suggestions
      }
    });

  } catch (error) {
    next(new AppError(error.message || 'Failed to analyze resume', 500));
  }
};

module.exports = {
  uploadResume,
  matchResumeWithJD,
  analyzeResume
};
