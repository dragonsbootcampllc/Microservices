const asyncHandler = require("express-async-handler");
const { StatusCodes } = require("http-status-codes");

const { UserAttemptAnalysisService } = require("../../services");

class UserAttemptAnalysisController {
  static getAnalysis = asyncHandler(async (req, res) => {
    const client = req.client;
    const { userId, attemptId } = req.params;

    const analysis = await UserAttemptAnalysisService.getAnalysis(
      client.id,
      userId,
      attemptId
    );

    res.status(StatusCodes.OK).json({
      data: {
        analysis,
      },
    });
  });
}

module.exports = UserAttemptAnalysisController;
