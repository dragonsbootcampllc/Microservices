const { StatusCodes } = require("http-status-codes");

const { HttpError } = require("../errors");
const { validateIds, validatePage, validateLimit } = require("../validations");
const { AttemptMapper } = require("../mappers");
const { ModelsGenerator } = require("../models");

class UserQuizAttemptService {
  // usecases

  static async getAttempts(
    collectionId,
    userId,
    quizId,
    { page = 1, limit = 20 } = {}
  ) {
    validateIds({ userId, quizId });

    const { User, Quiz, Attempt } = ModelsGenerator.generate(collectionId);

    await this.#checkIfUserExists(User, userId);

    await this.#checkIfQuizExists(Quiz, quizId);

    validatePage(page);
    validateLimit(limit);

    page = Number(page);
    limit = Number(limit);

    const attempts = await Attempt.find({ user: userId, quiz: quizId })
      .sort({ startTime: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("quiz")
      .populate("version");

    const count = await Attempt.countDocuments({
      user: userId,
      quiz: quizId,
    });

    return {
      attempts: attempts.map((attempt) =>
        AttemptMapper.toDTO(attempt, attempt.quiz, attempt.version)
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

  static async #checkIfQuizExists(model, quizId) {
    const exists = await model.exists({ _id: quizId });

    if (!exists) {
      throw new HttpError(
        StatusCodes.NOT_FOUND,
        "There is no quiz with this id."
      );
    }
  }
}

module.exports = UserQuizAttemptService;
