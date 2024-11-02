const { StatusCodes } = require("http-status-codes");

const { HttpError } = require("../errors");
const { validateIds, validatePage, validateLimit } = require("../validations");
const { QuestionMapper } = require("../mappers");
const { ModelsGenerator } = require("../models");

class QuizVersionQuestionService {
  // usecases

  static async getQuestion(collectionId, quizId, versionId, questionId) {
    validateIds({ quizId, versionId, questionId });

    const { Quiz, QuizVersion, Question } =
      ModelsGenerator.generate(collectionId);

    await this.#checkIfQuizExists(Quiz, quizId);
    await this.#checkIfVersionForQuizExists(QuizVersion, quizId, versionId);

    const question = await this.#getQuestionForVersionIfExists(
      Question,
      versionId,
      questionId
    );

    return QuestionMapper.toDTO(question);
  }

  static async getQuestions(
    collectionId,
    quizId,
    versionId,
    { page = 1, limit = 20 } = {}
  ) {
    validateIds({ quizId, versionId });

    const { Quiz, QuizVersion, Question } =
      ModelsGenerator.generate(collectionId);

    await this.#checkIfQuizExists(Quiz, quizId);
    await this.#checkIfVersionForQuizExists(QuizVersion, quizId, versionId);

    validatePage(page);
    validateLimit(limit);

    page = Number(page);
    limit = Number(limit);

    const questions = await Question.find({ version: versionId })
      .sort({ createTime: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const count = await Question.countDocuments({
      version: versionId,
    });

    return {
      questions: questions.map((question) => QuestionMapper.toDTO(question)),
      pagination: {
        page: count ? page : 0,
        pageCount: Math.ceil(count / limit),
      },
    };
  }

  // helpers

  static async #checkIfQuizExists(model, quizId) {
    const exists = await model.exists({ _id: quizId });

    if (!exists) {
      throw new HttpError(
        StatusCodes.NOT_FOUND,
        "There is no quiz with this id."
      );
    }
  }

  static async #checkIfVersionForQuizExists(model, quizId, versionId) {
    const exists = await model.exists({ _id: versionId, quiz: quizId });

    if (!exists) {
      throw new HttpError(
        StatusCodes.NOT_FOUND,
        "There is no version with this id for this quiz."
      );
    }
  }

  static async #getQuestionForVersionIfExists(model, versionId, questionId) {
    const question = await model.findOne({
      _id: questionId,
      version: versionId,
    });

    if (!question) {
      throw new HttpError(
        StatusCodes.NOT_FOUND,
        "There is no question with this id for this version."
      );
    }

    return question;
  }
}

module.exports = QuizVersionQuestionService;
