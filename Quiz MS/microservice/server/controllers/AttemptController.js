const asyncHandler = require("express-async-handler");
const { StatusCodes } = require("http-status-codes");

const { AttemptService } = require("../../services");

class AttemptController {
  static startAttempt = asyncHandler(async (req, res) => {
    const client = req.client;
    const { userId, quizId } = req.params;

    const attempt = await AttemptService.startAttempt(
      client.id,
      userId,
      quizId
    );

    res.status(StatusCodes.CREATED).json({
      data: {
        attempt: attempt.toObject(),
      },
    });
  });

  static endAttempt = asyncHandler(async (req, res) => {
    const client = req.client;
    const { userId, attemptId } = req.params;

    const attempt = await AttemptService.endAttempt(
      client.id,
      userId,
      attemptId
    );

    res.status(StatusCodes.OK).json({
      data: {
        attempt: attempt.toObject(),
      },
    });
  });

  static getAttempt = asyncHandler(async (req, res) => {
    const client = req.client;
    const { userId, attemptId } = req.params;

    const attempt = await AttemptService.getAttempt(
      client.id,
      userId,
      attemptId
    );

    res.status(StatusCodes.OK).json({
      data: {
        attempt: attempt.toObject(),
      },
    });
  });

  static getAttemptQuestions = asyncHandler(async (req, res) => {
    const client = req.client;
    const { userId, attemptId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const { questions, pagination } = await AttemptService.getAttemptQuestions(
      client.id,
      userId,
      attemptId,
      {
        page,
        limit,
      }
    );

    res.status(StatusCodes.OK).json({
      data: {
        questions: questions.map((question) => question.toObject()),
      },
      metadata: {
        pagination,
      },
    });
  });
}

module.exports = AttemptController;
