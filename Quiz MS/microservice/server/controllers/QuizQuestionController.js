const asyncHandler = require("express-async-handler");
const { StatusCodes } = require("http-status-codes");

const { QuizQuestionService } = require("../../services");

class QuizQuestionController {
  static createQuestion = asyncHandler(async (req, res) => {
    const client = req.client;
    const { quizId } = req.params;
    const { type, text, options, answer, points } = req.body;

    const question = await QuizQuestionService.createQuestion(
      client.id,
      quizId,
      {
        type,
        text,
        options,
        answer,
        points,
      }
    );

    res.status(StatusCodes.CREATED).json({
      data: {
        question,
      },
    });
  });

  static updateQuestion = asyncHandler(async (req, res) => {
    const client = req.client;
    const { quizId, questionId } = req.params;
    const { type, text, options, answer, points } = req.body;

    const question = await QuizQuestionService.updateQuestion(
      client.id,
      quizId,
      questionId,
      {
        type,
        text,
        options,
        answer,
        points,
      }
    );

    res.status(StatusCodes.OK).json({
      data: {
        question,
      },
    });
  });

  static deleteQuestion = asyncHandler(async (req, res) => {
    const client = req.client;
    const { quizId, questionId } = req.params;

    await QuizQuestionService.deleteQuestion(client.id, quizId, questionId);

    res.status(StatusCodes.NO_CONTENT).send();
  });

  static getQuestion = asyncHandler(async (req, res) => {
    const client = req.client;
    const { quizId, questionId } = req.params;

    const question = await QuizQuestionService.getQuestion(
      client.id,
      quizId,
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
    const { quizId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const { questions, pagination } = await QuizQuestionService.getQuestions(
      client.id,
      quizId,
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

module.exports = QuizQuestionController;
