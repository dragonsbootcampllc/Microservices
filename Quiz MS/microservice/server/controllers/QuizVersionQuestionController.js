const asyncHandler = require("express-async-handler");
const { StatusCodes } = require("http-status-codes");

const { QuizVersionQuestionService } = require("../../services");

class QuizVersionQuestionController {
  static getQuestion = asyncHandler(async (req, res) => {
    const client = req.client;
    const { quizId, versionId, questionId } = req.params;

    const question = await QuizVersionQuestionService.getQuestion(
      client.id,
      quizId,
      versionId,
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
    const { quizId, versionId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const { questions, pagination } =
      await QuizVersionQuestionService.getQuestions(
        client.id,
        quizId,
        versionId,
        {
          page,
          limit,
        }
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

module.exports = QuizVersionQuestionController;
