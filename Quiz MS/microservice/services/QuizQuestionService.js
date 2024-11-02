const { StatusCodes } = require("http-status-codes");
const validator = require("validator");

const { HttpError } = require("../errors");
const { QuizStatus, QuestionsType } = require("../enums");
const { validateIds, validatePage, validateLimit } = require("../validations");
const { QuestionMapper } = require("../mappers");
const { ModelsGenerator } = require("../models");

class QuizQuestionService {
  // usecases

  static async createQuestion(collectionId, quizId, data) {
    validateIds({ quizId });

    const { QuizVersion, Question } = ModelsGenerator.generate(collectionId);

    const version = await this.#getActiveVersionForQuizIfExists(
      QuizVersion,
      quizId
    );

    const quiz = version.quiz;

    this.#checkIfQuizCanBeUpdated(quiz);

    const { type, text, options, answer, points } = data;

    this.#validateType(type);
    this.#validateText(text);
    this.#validateOptions(type, options);
    this.#validateAnswer(type, options, answer);
    this.#validatePoints(points);

    const now = Date.now();

    const question = new Question({
      type,
      text,
      options,
      answer,
      points,
      createTime: now,
      updateTime: now,
    });

    question.quiz = quiz._id;
    question.version = version._id;

    quiz.updateTime = version.updateTime = now;

    await Promise.all([quiz.save(), version.save(), question.save()]);

    return QuestionMapper.toDTO(question);
  }

  static async updateQuestion(collectionId, quizId, questionId, data) {
    validateIds({ quizId, questionId });

    const { QuizVersion, Question } = ModelsGenerator.generate(collectionId);

    const version = await this.#getActiveVersionForQuizIfExists(
      QuizVersion,
      quizId
    );

    const quiz = version.quiz;

    const question = await this.#getQuestionForVersionIfExists(
      Question,
      version._id,
      questionId
    );

    this.#checkIfQuizCanBeUpdated(quiz);

    const { type, text, options, answer, points } = data;

    if (type !== undefined) {
      this.#validateType(type);
      question.type = type;
    }

    if (text !== undefined) {
      this.#validateText(text);
      question.text = text;
    }

    if (options !== undefined) {
      this.#validateOptions(question.type, options);
      question.options = options;
    }

    if (answer !== undefined) {
      this.#validateAnswer(question.type, question.options, answer);
      question.answer = answer;
    }

    if (points !== undefined) {
      this.#validatePoints(points);
      question.points = points;
    }

    question.updateTime = version.updateTime = quiz.updateTime = Date.now();

    await Promise.all([quiz.save(), version.save(), question.save()]);

    return QuestionMapper.toDTO(question);
  }

  static async deleteQuestion(collectionId, quizId, questionId) {
    validateIds({ quizId, questionId });

    const { QuizVersion, Question } = ModelsGenerator.generate(collectionId);

    const version = await this.#getActiveVersionForQuizIfExists(
      QuizVersion,
      quizId
    );

    const quiz = version.quiz;

    const question = await this.#getQuestionForVersionIfExists(
      Question,
      version._id,
      questionId
    );

    this.#checkIfQuizCanBeUpdated(quiz);

    await question.deleteOne();

    version.updateTime = quiz.updateTime = Date.now();

    await Promise.all([quiz.save(), version.save()]);

    return QuestionMapper.toDTO(question);
  }

  static async getQuestion(collectionId, quizId, questionId) {
    validateIds({ quizId, questionId });

    const { QuizVersion, Question } = ModelsGenerator.generate(collectionId);

    const version = await this.#getActiveVersionForQuizIfExists(
      QuizVersion,
      quizId
    );

    const question = await this.#getQuestionForVersionIfExists(
      Question,
      version._id,
      questionId
    );

    return QuestionMapper.toDTO(question);
  }

  static async getQuestions(
    collectionId,
    quizId,
    { page = 1, limit = 20 } = {}
  ) {
    validateIds({ quizId });

    const { QuizVersion, Question } = ModelsGenerator.generate(collectionId);

    const version = await this.#getActiveVersionForQuizIfExists(
      QuizVersion,
      quizId
    );

    validatePage(page);
    validateLimit(limit);

    page = Number(page);
    limit = Number(limit);

    const questions = await Question.find({ version: version._id })
      .sort({ createTime: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const count = await Question.countDocuments({
      version: version._id,
    });

    return {
      questions: questions.map((question) => QuestionMapper.toDTO(question)),
      pagination: {
        page: count ? page : 0,
        pageCount: Math.ceil(count / limit),
      },
    };
  }

  // validations

  static #validateType(type) {
    if (!Object.values(QuestionsType).includes(type)) {
      throw new HttpError(StatusCodes.BAD_REQUEST, 'Invalid "type".');
    }
  }

  static #validateText(text) {
    if (
      typeof text !== "string" ||
      !validator.isLength(text, { min: 1, max: 500 })
    ) {
      throw new HttpError(
        StatusCodes.BAD_REQUEST,
        'Invalid "text": It must be a string between 1 and 500 characters.'
      );
    }
  }

  static #validateOptions(type, options) {
    if (type === QuestionsType.MULTIPLE_CHOICE) {
      if (
        !Array.isArray(options) ||
        options.length < 1 ||
        options.length > 100
      ) {
        throw new HttpError(
          StatusCodes.BAD_REQUEST,
          'Invalid "options": It must be an array containing between 1 and 100 options for multiple-choice questions.'
        );
      }

      if (
        !options.every(
          (option) =>
            typeof option === "string" &&
            validator.isLength(option, { min: 1, max: 100 })
        )
      ) {
        throw new HttpError(
          StatusCodes.BAD_REQUEST,
          'Invalid "options": Each option must be a string between 1 and 100 characters for multiple-choice questions.'
        );
      }
    } else if (options !== null) {
      throw new HttpError(
        StatusCodes.BAD_REQUEST,
        'Invalid "options": It must be null for non-multiple-choice questions.'
      );
    }
  }

  static #validateAnswer(type, options, answer) {
    switch (type) {
      case QuestionsType.TRUE_FALSE:
        if (typeof answer !== "boolean") {
          throw new HttpError(
            StatusCodes.BAD_REQUEST,
            'Invalid "answer": It must be a boolean for true-fasle questions.'
          );
        }

        break;
      case QuestionsType.MILTIPLE_CHOICE:
        if (!options.includes(answer)) {
          throw new HttpError(
            StatusCodes.BAD_REQUEST,
            'Invalid "answer": It must be one of the provided options for multiple-choice questions.'
          );
        }

        break;
      case QuestionsType.FILL_IN_THE_BLANK:
        if (
          typeof answer !== "string" ||
          !validator.isLength(answer, { min: 1, max: 100 })
        ) {
          throw new HttpError(
            StatusCodes.BAD_REQUEST,
            'Invalid "answer": It must be a string between 1 and 100 characters for fill-in-the-blank questions.'
          );
        }

        break;
      default:
        throw new HttpError(
          StatusCodes.BAD_REQUEST,
          'Invalid "answer": It must be null for open-ended questions.'
        );
    }
  }

  static #validatePoints(points) {
    if (!validator.isInt(String(points), { min: 1 })) {
      throw new HttpError(
        StatusCodes.BAD_REQUEST,
        'Invalid "points": It must be a positive integer.'
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

  static #checkIfQuizCanBeUpdated(quiz) {
    if (quiz.status !== QuizStatus.DRAFTED) {
      throw new HttpError(StatusCodes.CONFLICT, "This quiz cannot be updated.");
    }
  }
}

module.exports = QuizQuestionService;
