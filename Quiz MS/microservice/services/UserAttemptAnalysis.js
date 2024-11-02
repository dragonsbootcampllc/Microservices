const { StatusCodes } = require("http-status-codes");

const { HttpError } = require("../errors");
const { validateIds } = require("../validations");
const { ModelsGenerator } = require("../models");

class UserAttemptService {
  // usecases

  static async getAnalysis(collectionId, userId, attemptId) {
    validateIds({ userId, attemptId });

    const { User, Attempt, Question, Response } =
      ModelsGenerator.generate(collectionId);

    await this.#checkIfUserExists(User, userId);

    const attempt = await this.#getAttemptForUserIfExists(
      Attempt,
      userId,
      attemptId
    );

    const version = attempt.version;

    const questions = await Question.find({ version: version._id });
    const responses = await Response.find({ attempt: attempt._id });

    const totalQuestions = questions.length;
    const totalAnswers = responses.length;

    let totalPoints = 0;

    questions.forEach((question) => {
      totalPoints += question.points;
    });

    let totalCorrectAnswers = 0;
    let totalScore = 0;

    responses.forEach((response) => {
      if (response.score) {
        totalCorrectAnswers += 1;
        totalScore += response.score;
      }
    });

    return {
      startTime: attempt.startTime,
      endTime: attempt.endTime,
      totalQuestions,
      totalAnswers,
      totalCorrectAnswers,
      totalPoints,
      totalScore,
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

module.exports = UserAttemptService;
