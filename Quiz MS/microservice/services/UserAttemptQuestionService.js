const { StatusCodes } = require("http-status-codes");

const { HttpError } = require("../errors");
// const { QuestionsType } = require("../enums");
const { validateIds, validatePage, validateLimit } = require("../validations");
const { QuestionMapper, ResponseMapper } = require("../mappers");
const { ModelsGenerator } = require("../models");

class UserAttemptQuestionService {
  // usecases

  static async submitAnswer(
    collectionId,
    userId,
    attemptId,
    questionId,
    answer
  ) {
    validateIds({ userId, attemptId, questionId });

    const { User, Attempt, Question, Response } =
      ModelsGenerator.generate(collectionId);

    await this.#checkIfUserExists(User, userId);

    const attempt = await this.#getAttemptForUserIfExists(
      Attempt,
      userId,
      attemptId
    );

    if (!attempt.active) {
      throw new HttpError(StatusCodes.BAD_REQUEST, "This attempt ended.");
    }

    const version = attempt.version;

    const question = await Question.findOne({
      _id: questionId,
      version: version._id,
    });

    if (!question) {
      throw new HttpError(
        StatusCodes.NOT_FOUND,
        "There is no question with this id for this attempt."
      );
    }

    const submitted = await Response.exists({
      attempt: attempt._id,
      question: question._id,
    });

    if (submitted) {
      throw new HttpError(StatusCodes.BAD_REQUEST, "This question submitted.");
    }

    let score = 0;

    switch (question.type) {
      /* Open-Ended questions needs AI

      case QuestionType.SHORT_ANSWER:
        break;

      case QuestionType.LONG_ANSWER:
        break;

      case QuestionType.VIDEO_RESPONSE:
        break;

      case QuestionType.AUDIO_RESPONSE:
        break;

      */
      default:
        if (typeof answer !== typeof question.answer) {
          throw new HttpError(
            StatusCodes.BAD_REQUEST,
            `Invalid "answer": It must be a ${typeof question.answer}.`
          );
        }

        if (answer === question.answer) {
          score = question.points;
        }
    }

    const response = new Response({ answer, score, submitTime: Date.now() });

    response.attempt = attempt._id;
    response.question = question._id;

    await response.save();

    return ResponseMapper.toDTO(response, question);
  }

  static async getQuestion(collectionId, userId, attemptId, questionId) {
    validateIds({ userId, attemptId, questionId });

    const { User, Attempt, Question } = ModelsGenerator.generate(collectionId);

    await this.#checkIfUserExists(User, userId);

    const attempt = await this.#getAttemptForUserIfExists(
      Attempt,
      userId,
      attemptId
    );

    const version = attempt.version;

    const question = await Question.findOne({
      _id: questionId,
      version: version._id,
    });

    if (!question) {
      throw new HttpError(
        StatusCodes.NOT_FOUND,
        "There is no question with this id for this attempt."
      );
    }

    return QuestionMapper.toDTO(question, { answerIncluded: false });
  }

  static async getQuestions(
    collectionId,
    userId,
    attemptId,
    { page = 1, limit = 20 } = {}
  ) {
    validateIds({ userId, attemptId });

    const { User, Attempt, Question } = ModelsGenerator.generate(collectionId);

    await this.#checkIfUserExists(User, userId);

    const attempt = await this.#getAttemptForUserIfExists(
      Attempt,
      userId,
      attemptId
    );
    const version = attempt.version;

    validatePage(page);
    validateLimit(limit);

    page = Number(page);
    limit = Number(limit);

    const questions = await Question.find({ version: version._id })
      .sort({ createTime: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const count = await Question.countDocuments({ version: version._id });

    return {
      questions: questions.map((question) =>
        QuestionMapper.toDTO(question, { answerIncluded: false })
      ),
      pagination: {
        page: count ? page : 0,
        pageCount: Math.ceil(count / limit),
      },
    };
  }

  // helpers

  static async #checkIfUserExists(model, userId) {
    const exists = await model.exists({ _id: userId });

    if (!exists) {
      throw new HttpError(
        StatusCodes.NOT_FOUND,
        "There is no user with this id."
      );
    }
  }

  static async #getAttemptForUserIfExists(model, userId, attemptId) {
    const attempt = await model
      .findOne({ _id: attemptId, user: userId })
      .populate("version");

    if (!attempt) {
      throw new HttpError(
        StatusCodes.NOT_FOUND,
        "There is no attempt with this id for this user."
      );
    }

    return attempt;
  }
}

module.exports = UserAttemptQuestionService;
