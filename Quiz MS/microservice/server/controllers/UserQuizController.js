const asyncHandler = require("express-async-handler");
const { StatusCodes } = require("http-status-codes");

const { UserQuizService } = require("../../services");

class UserQuizController {
  static startAttempt = asyncHandler(async (req, res) => {
    const client = req.client;
    const { userId, quizId } = req.params;

    const attempt = await UserQuizService.startAttempt(
      client.id,
      userId,
      quizId
    );

    res.status(StatusCodes.CREATED).json({
      data: {
        attempt,
      },
    });
  });
}

module.exports = UserQuizController;
