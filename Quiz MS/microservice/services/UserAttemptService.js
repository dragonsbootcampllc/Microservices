const { StatusCodes } = require("http-status-codes");

const { HttpError } = require("../errors");
const { validateIds, validatePage, validateLimit } = require("../validations");
const { AttemptMapper } = require("../mappers");
const { ModelsGenerator } = require("../models");

class UserAttemptService {
  // usecases

  static async endAttempt(collectionId, userId, attemptId) {
    validateIds({ userId, attemptId });

    const { User, Attempt } = ModelsGenerator.generate(collectionId);

    await this.#checkIfUserExists(User, userId);

    const attempt = await this.#getAttemptForUserIfExists(
      Attempt,
      userId,
      attemptId
    );

    if (!attempt.active) {
      throw new HttpError(
        StatusCodes.BAD_REQUEST,
        "This attempt has already been ended."
      );
    }

    attempt.active = false;
    attempt.endTime = Date.now();

    await attempt.save();

    return AttemptMapper.toDTO(attempt, attempt.quiz, attempt.version);
  }

  static async getAttempt(collectionId, userId, attemptId) {
    validateIds({ userId, attemptId });

    const { User, Attempt } = ModelsGenerator.generate(collectionId);

    await this.#checkIfUserExists(User, userId);

    const attempt = await this.#getAttemptForUserIfExists(
      Attempt,
      userId,
      attemptId
    );

    return AttemptMapper.toDTO(attempt, attempt.quiz, attempt.version);
  }

  static async getAttempts(
    collectionId,
    userId,
    { page = 1, limit = 20 } = {}
  ) {
    validateIds({ userId });

    const { User, Attempt } = ModelsGenerator.generate(collectionId);

    await this.#checkIfUserExists(User, userId);

    validatePage(page);
    validateLimit(limit);

    page = Number(page);
    limit = Number(limit);

    const attempts = await Attempt.find({ user: userId })
      .sort({ startTime: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("quiz")
      .populate("version");

    const count = await Attempt.countDocuments({
      user: userId,
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

  static async #getAttemptForUserIfExists(model, userId, attemptId) {
    const attempt = await model
      .findOne({ _id: attemptId, user: userId })
      .populate("quiz")
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

module.exports = UserAttemptService;
