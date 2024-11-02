const { StatusCodes } = require("http-status-codes");

const { HttpError } = require("../errors");
const { validateIds, validatePage, validateLimit } = require("../validations");
const { ResponseMapper } = require("../mappers");
const { ModelsGenerator } = require("../models");

class UserAttemptQuestionService {
  // usecases

  static async getResponse(collectionId, userId, attemptId, responseId) {
    validateIds({ userId, attemptId, responseId });

    const { User, Attempt, Response } = ModelsGenerator.generate(collectionId);

    await this.#checkIfUserExists(User, userId);

    const attempt = await this.#getAttemptForUserIfExists(
      Attempt,
      userId,
      attemptId
    );

    const response = await Response.findOne({
      _id: responseId,
      attempt: attempt._id,
    }).populate("question");

    if (!response) {
      throw new HttpError(
        StatusCodes.NOT_FOUND,
        "There is no response with this id for this attempt."
      );
    }

    return ResponseMapper.toDTO(response, response.question);
  }

  static async getResponses(
    collectionId,
    userId,
    attemptId,
    { page = 1, limit = 20 } = {}
  ) {
    validateIds({ userId, attemptId });

    const { User, Attempt, Response } = ModelsGenerator.generate(collectionId);

    await this.#checkIfUserExists(User, userId);

    const attempt = await this.#getAttemptForUserIfExists(
      Attempt,
      userId,
      attemptId
    );

    validatePage(page);
    validateLimit(limit);

    page = Number(page);
    limit = Number(limit);

    const responses = await Response.find({ attempt: attempt._id })
      .sort({ submitTime: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("question");

    const count = await Response.countDocuments({ attempt: attempt._id });

    return {
      responses: responses.map((response) =>
        ResponseMapper.toDTO(response, response.question)
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
    const attempt = await model.findOne({ _id: attemptId, user: userId });

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
