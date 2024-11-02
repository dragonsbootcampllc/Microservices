const { StatusCodes } = require("http-status-codes");

const { HttpError } = require("../errors");
const { QuizStatus } = require("../enums");
const { validateIds } = require("../validations");
const { AttemptMapper } = require("../mappers");
const { ModelsGenerator } = require("../models");
const { jobQueue } = require("../job-scheduler");

class UserQuizService {
  // usecases

  static async startAttempt(collectionId, userId, quizId) {
    validateIds({ userId, quizId });

    const { User, QuizVersion, Attempt } =
      ModelsGenerator.generate(collectionId);

    const time = Date.now();

    const user = await User.findByIdAndUpdate(
      userId,
      { createTime: time, updateTime: time },
      { upsert: true, new: true }
    );

    await this.#checkIfUserHasActiveAttempt(Attempt, user._id);

    const version = await this.#getActiveVersionForQuizIfExists(
      QuizVersion,
      quizId
    );

    const quiz = version.quiz;

    if (quiz.status !== QuizStatus.PUBLISHED) {
      throw new HttpError(StatusCodes.BAD_REQUEST, "This quiz not published.");
    }

    // Here we will use AI to generate a version of this quiz for each user attempt

    const attempt = new Attempt({
      active: true,
      startTime: time,
      endTime: time + version.duration * 1000,
    });

    attempt.user = user._id;
    attempt.quiz = quiz._id;
    attempt.version = version._id;

    jobQueue.add(
      "end-attempt",
      { collectionId, attemptId: attempt._id },
      { delay: version.duration * 1000 }
    );

    Promise.all([quiz.save(), version.save(), attempt.save()]);

    return AttemptMapper.toDTO(attempt, quiz, version);
  }

  // helpers

  static async #checkIfUserHasActiveAttempt(model, userId) {
    const attempt = await model.findOne({ user: userId, active: true });

    if (attempt) {
      throw new HttpError(
        StatusCodes.CONFLICT,
        `There is an active attempt with id "${attempt._id}" for this user.`
      );
    }
  }

  static async #getActiveVersionForQuizIfExists(model, quizId) {
    const version = await model
      .findOne({
        quiz: quizId,
        active: true,
      })
      .populate("quiz");

    if (!version) {
      throw new HttpError(
        StatusCodes.NOT_FOUND,
        "There is no active version for quiz with this id."
      );
    }

    return version;
  }
}

module.exports = UserQuizService;
