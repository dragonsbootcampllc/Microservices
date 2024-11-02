const asyncHandler = require("express-async-handler");
const { StatusCodes } = require("http-status-codes");

const { UserAttemptQuestionService } = require("../../services");

class UserAttemptQuetsionController {
  static submitAnswer = asyncHandler(async (req, res) => {
    const client = req.client;
    const { userId, attemptId, questionId } = req.params;
    const { answer } = req.body;

    const response = await UserAttemptQuestionService.submitAnswer(
      client.id,
      userId,
      attemptId,
      questionId,
      answer
    );

    res.status(StatusCodes.OK).json({
      data: {
        response,
      },
    });
  });

  static getQuestion = asyncHandler(async (req, res) => {
    const client = req.client;
    const { userId, attemptId, questionId } = req.params;

    const question = await UserAttemptQuestionService.getQuestion(
      client.id,
      userId,
      attemptId,
      questionId
    );

    res.status(StatusCodes.OK).json({
      data: {
        question,
      },
    });
  });

  static getQuestions = asyncHandler(async (req, res) => {
    const client = req.client;
    const { userId, attemptId } = req.params;
    const { page, limit } = req.query;

    const { questions, pagination } =
      await UserAttemptQuestionService.getQuestions(
        client.id,
        userId,
        attemptId,
        { page, limit }
      );

    res.status(StatusCodes.OK).json({
      data: {
        questions,
      },
      metadata: {
        pagination,
      },
    });
  });
}

module.exports = UserAttemptQuetsionController;
