const asyncHandler = require("express-async-handler");
const { StatusCodes } = require("http-status-codes");

const { QuizVersionService } = require("../../services");

class QuizVersionController {
  static getVersion = asyncHandler(async (req, res) => {
    const client = req.client;
    const { quizId, versionId } = req.params;

    const version = await QuizVersionService.getVersion(
      client.id,
      quizId,
      versionId
    );

    res.status(StatusCodes.OK).json({
      data: {
        version,
      },
    });
  });

  static getVersions = asyncHandler(async (req, res) => {
    const client = req.client;
    const { quizId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const { versions, pagination } = await QuizVersionService.getVersions(
      client.id,
      quizId,
      {
        page,
        limit,
      }
    );

    res.status(StatusCodes.OK).json({
      data: {
        versions,
      },
      metadata: {
        pagination,
      },
    });
  });
}

module.exports = QuizVersionController;
