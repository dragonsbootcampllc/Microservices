const asyncHandler = require("express-async-handler");
const { StatusCodes } = require("http-status-codes");

const { UserQuizAttemptService } = require("../../services");

class UserQuizAttemptController {
  static getAttempts = asyncHandler(async (req, res) => {
    const client = req.client;
    const { userId, quizId } = req.params;
    const { page, limit } = req.query;

    const { attempts, pagination } = await UserQuizAttemptService.getAttempts(
      client.id,
      userId,
      quizId,
      { page, limit }
    );

    res.status(StatusCodes.OK).json({
      data: {
        attempts,
      },
      metadata: {
        pagination,
      },
    });
  });
}

module.exports = UserQuizAttemptController;
