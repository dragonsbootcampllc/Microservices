const asyncHandler = require("express-async-handler");
const { StatusCodes } = require("http-status-codes");

const { QuizService } = require("../../services");

class QuizController {
  static createQuiz = asyncHandler(async (req, res) => {
    const client = req.client;
    const { title, description, duration } = req.body;

    const quiz = await QuizService.createQuiz(client.id, {
      title,
      description,
      duration,
    });

    res.status(StatusCodes.CREATED).json({
      data: {
        quiz,
      },
    });
  });

  static updateQuiz = asyncHandler(async (req, res) => {
    const client = req.client;
    const { quizId } = req.params;
    const { title, description, duration } = req.body;

    const quiz = await QuizService.updateQuiz(client.id, quizId, {
      title,
      description,
      duration,
    });

    res.status(StatusCodes.OK).json({
      data: {
        quiz,
      },
    });
  });

  static publishQuiz = asyncHandler(async (req, res) => {
    const client = req.client;
    const { quizId } = req.params;

    const quiz = await QuizService.publishQuiz(client.id, quizId);

    res.status(StatusCodes.OK).json({
      data: {
        quiz,
      },
    });
  });

  static draftQuiz = asyncHandler(async (req, res) => {
    const client = req.client;
    const { quizId } = req.params;

    const quiz = await QuizService.draftQuiz(client.id, quizId);

    res.status(StatusCodes.OK).json({
      data: {
        quiz,
      },
    });
  });

  static archiveQuiz = asyncHandler(async (req, res) => {
    const client = req.client;
    const { quizId } = req.params;

    const quiz = await QuizService.archiveQuiz(client.id, quizId);

    res.status(StatusCodes.OK).json({
      data: {
        quiz,
      },
    });
  });

  static getQuiz = asyncHandler(async (req, res) => {
    const client = req.client;
    const { quizId } = req.params;

    const quiz = await QuizService.getQuiz(client.id, quizId);

    res.status(StatusCodes.OK).json({
      data: {
        quiz,
      },
    });
  });

  static getQuizzes = asyncHandler(async (req, res) => {
    const client = req.client;
    const { page = 1, limit = 20 } = req.query;

    const { quizzes, pagination } = await QuizService.getQuizzes(client.id, {
      page,
      limit,
    });

    res.status(StatusCodes.OK).json({
      data: {
        quizzes,
      },
      metadata: {
        pagination,
      },
    });
  });
}

module.exports = QuizController;
