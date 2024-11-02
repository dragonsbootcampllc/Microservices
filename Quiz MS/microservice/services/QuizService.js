const { StatusCodes } = require("http-status-codes");
const validator = require("validator");

const { HttpError } = require("../errors");
const { QuizStatus } = require("../enums");
const { validateIds, validatePage, validateLimit } = require("../validations");
const { QuizMapper } = require("../mappers");
const { ModelsGenerator } = require("../models");

class QuizService {
  // usecases

  static async createQuiz(collectionId, data = {}) {
    const { title, description, duration } = data;

    this.#validateTitle(title);
    this.#validateDescription(description);
    this.#validateDuration(duration);

    const { Quiz, QuizVersion } = ModelsGenerator.generate(collectionId);

    const now = Date.now();

    const quiz = new Quiz({
      status: QuizStatus.DRAFTED,
      createTime: now,
      updateTime: now,
    });

    const version = new QuizVersion({
      number: 1,
      title,
      description,
      duration,
      active: true,
      createTime: now,
      updateTime: now,
    });

    version.quiz = quiz._id;

    await Promise.all([quiz.save(), version.save()]);

    return QuizMapper.toDTO(quiz, version);
  }

  static async updateQuiz(collectionId, quizId, data = {}) {
    validateIds({ quizId });

    const { QuizVersion } = ModelsGenerator.generate(collectionId);

    const version = await this.#getActiveVersionForQuizIfExists(
      QuizVersion,
      quizId
    );

    const quiz = version.quiz;

    this.#checkIfQuizCanBeUpdated(quiz);

    const { title, description, duration } = data;

    if (title !== undefined) {
      this.#validateTitle(title);
      version.title = title;
    }

    if (description !== undefined) {
      this.#validateDescription(description);
      version.description = description;
    }

    if (duration !== undefined) {
      this.#validateDuration(duration);
      version.duration = duration;
    }

    quiz.updateTime = version.updateTime = Date.now();

    await Promise.all([quiz.save(), version.save()]);

    return QuizMapper.toDTO(quiz, version);
  }

  static async publishQuiz(collectionId, quizId) {
    validateIds({ quizId });

    const { QuizVersion } = ModelsGenerator.generate(collectionId);

    const version = await this.#getActiveVersionForQuizIfExists(
      QuizVersion,
      quizId
    );

    const quiz = version.quiz;

    if (quiz.status === QuizStatus.PUBLISHED) {
      throw new HttpError(
        StatusCodes.CONFLICT,
        "This quiz is already published."
      );
    }

    quiz.status = QuizStatus.PUBLISHED;
    quiz.updateTime = Date.now();

    await quiz.save();

    return QuizMapper.toDTO(quiz, version);
  }

  static async draftQuiz(collectionId, quizId) {
    validateIds({ quizId });

    const { QuizVersion, Question } = ModelsGenerator.generate(collectionId);

    const version = await this.#getActiveVersionForQuizIfExists(
      QuizVersion,
      quizId
    );

    const quiz = version.quiz;

    if (quiz.status === QuizStatus.DRAFTED) {
      throw new HttpError(
        StatusCodes.CONFLICT,
        "This quiz is already drafted."
      );
    }

    version.active = false;

    const count = await QuizVersion.countDocuments({ quiz: quiz._id });

    const { title, description, duration } = version;

    const now = Date.now();

    const versionCopy = new QuizVersion({
      number: count + 1,
      title,
      description,
      duration,
      active: true,
      createTime: now,
      updateTime: now,
    });

    versionCopy.quiz = quiz._id;

    const questions = await Question.find({
      version: version._id,
    });

    const questionCopies = questions.map((question) => {
      const { type, text, options, answer, points } = question;

      const questionCopy = new Question({
        type,
        text,
        options,
        answer,
        points,
        createTime: now,
        updateTime: now,
      });

      questionCopy.quiz = quiz._id;
      questionCopy.version = versionCopy._id;

      return questionCopy;
    });

    quiz.status = QuizStatus.DRAFTED;
    quiz.updateTime = now;

    await Promise.all(
      questionCopies.map((questionCopy) => questionCopy.save())
    );

    await Promise.all([quiz.save(), version.save(), versionCopy.save()]);

    return QuizMapper.toDTO(quiz, versionCopy);
  }

  static async archiveQuiz(collectionId, quizId) {
    validateIds({ quizId });

    const { QuizVersion } = ModelsGenerator.generate(collectionId);

    const version = await this.#getActiveVersionForQuizIfExists(
      QuizVersion,
      quizId
    );

    const quiz = version.quiz;

    if (quiz.status === QuizStatus.ARCHIVED) {
      throw new HttpError(
        StatusCodes.CONFLICT,
        "This quiz is already archived."
      );
    }

    quiz.status = QuizStatus.ARCHIVED;

    await quiz.save();
    quiz.updateTime = Date.now();

    return QuizMapper.toDTO(quiz, version);
  }

  static async getQuiz(collectionId, quizId) {
    validateIds({ quizId });

    const { QuizVersion } = ModelsGenerator.generate(collectionId);

    const version = await this.#getActiveVersionForQuizIfExists(
      QuizVersion,
      quizId
    );

    const quiz = version.quiz;

    return QuizMapper.toDTO(quiz, version);
  }

  static async getQuizzes(collectionId, { page = 1, limit = 20 } = {}) {
    const { QuizVersion } = ModelsGenerator.generate(collectionId);

    validatePage(page);
    validateLimit(limit);

    page = Number(page);
    limit = Number(limit);

    const versions = await QuizVersion.find({ active: true })
      .sort({ createTime: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("quiz");

    const count = await QuizVersion.countDocuments({ active: true });

    return {
      quizzes: versions.map((version) => {
        const quiz = version.quiz;

        return QuizMapper.toDTO(quiz, version);
      }),
      pagination: {
        page: count ? page : 0,
        pageCount: Math.ceil(count / limit),
      },
    };
  }

  // validations

  static #validateTitle(title) {
    if (
      typeof title !== "string" ||
      !validator.isLength(title, { min: 1, max: 250 })
    ) {
      throw new HttpError(
        StatusCodes.BAD_REQUEST,
        'Invalid "title": It must be a string between 1 and 250 characters.'
      );
    }
  }

  static #validateDescription(description) {
    if (
      typeof description !== "string" ||
      !validator.isLength(description, { min: 1, max: 500 })
    ) {
      throw new HttpError(
        StatusCodes.BAD_REQUEST,
        'Invalid "description": It must be a string between 1 and 500 characters.'
      );
    }
  }

  static #validateDuration(duration) {
    if (duration !== null && !validator.isInt(String(duration), { min: 1 })) {
      throw new HttpError(
        StatusCodes.BAD_REQUEST,
        'Invalid "duration": It must be a positive integer.'
      );
    }
  }

  // helpers

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

  static #checkIfQuizCanBeUpdated(quiz) {
    if (quiz.status !== QuizStatus.DRAFTED) {
      throw new HttpError(StatusCodes.CONFLICT, "This quiz cannot be updated.");
    }
  }
}
module.exports = QuizService;
