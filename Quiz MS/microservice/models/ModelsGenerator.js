const mongoose = require("mongoose");
const { v4: generateUUID } = require("uuid");

class ModelsGenerator {
  static #cache = new Map();

  static generate(id) {
    const models = this.#cache.get(id);

    if (models) {
      return models;
    }

    const User = this.#generateUserModel(id);
    const Quiz = this.#generateQuizModel(id);
    const QuizVersion = this.#generateQuizVersionModel(id);
    const Question = this.#generateQuestionModel(id);
    const Attempt = this.#generateAttemptModel(id);
    const Response = this.#generateResponseModel(id);

    this.#cache.set(id, {
      User,
      Quiz,
      QuizVersion,
      Question,
      Attempt,
      Response,
    });

    return {
      User,
      Quiz,
      QuizVersion,
      Question,
      Attempt,
      Response,
    };
  }

  static #generateUserModel(id) {
    const schema = new mongoose.Schema({
      _id: {
        type: String,
        default: generateUUID,
      },
      createTime: {
        type: Date,
        required: true,
      },
      updateTime: {
        type: Date,
        required: true,
      },
    });

    return mongoose.model(`User_${id}`, schema, `users_${id}`);
  }

  static #generateQuizModel(id) {
    const schema = new mongoose.Schema({
      _id: {
        type: String,
        default: generateUUID,
      },
      status: {
        type: String,
        required: true,
      },
      createTime: {
        type: Date,
        required: true,
      },
      updateTime: {
        type: Date,
        required: true,
      },
    });

    return mongoose.model(`Quiz_${id}`, schema, `quizzes_${id}`);
  }

  static #generateQuizVersionModel(id) {
    const schema = new mongoose.Schema({
      _id: {
        type: String,
        default: generateUUID,
      },
      number: {
        type: Number,
        required: true,
      },
      title: {
        type: String,
        required: true,
      },
      description: {
        type: String,
        required: true,
      },
      duration: {
        type: Number,
        required: true,
      },
      active: {
        type: Boolean,
        required: true,
      },
      createTime: {
        type: Date,
        required: true,
      },
      updateTime: {
        type: Date,
        required: true,
      },
      quiz: {
        type: String,
        ref: `Quiz_${id}`,
        required: true,
      },
    });

    return mongoose.model(`QuizVersion_${id}`, schema, `quiz_versions_${id}`);
  }

  static #generateQuestionModel(id) {
    const schema = new mongoose.Schema({
      _id: {
        type: String,
        default: generateUUID,
      },
      type: {
        type: String,
        required: true,
      },
      text: {
        type: String,
        required: true,
      },
      options: {
        type: mongoose.Schema.Types.Mixed,
        default: null,
      },
      answer: {
        type: mongoose.Schema.Types.Mixed,
        default: null,
      },
      points: {
        type: Number,
        required: true,
      },
      createTime: {
        type: Date,
        required: true,
      },
      updateTime: {
        type: Date,
        required: true,
      },
      quiz: {
        type: String,
        ref: `Quiz_${id}`,
        required: true,
      },
      version: {
        type: String,
        ref: `QuizVersion_${id}`,
        required: true,
      },
    });

    return mongoose.model(`Question_${id}`, schema, `questions_${id}`);
  }

  static #generateAttemptModel(id) {
    const schema = new mongoose.Schema({
      _id: {
        type: String,
        default: generateUUID,
      },
      startTime: {
        type: Date,
        required: true,
      },
      endTime: {
        type: Date,
        required: true,
      },
      active: {
        type: Boolean,
        required: true,
      },
      user: {
        type: String,
        ref: `User_${id}`,
        required: true,
      },
      quiz: {
        type: String,
        ref: `Quiz_${id}`,
        required: true,
      },
      version: {
        type: String,
        ref: `QuizVersion_${id}`,
        required: true,
      },
    });

    return mongoose.model(`Attempt_${id}`, schema, `attempts_${id}`);
  }

  static #generateResponseModel(id) {
    const schema = new mongoose.Schema({
      _id: {
        type: String,
        default: generateUUID,
      },
      answer: {
        type: String,
        required: true,
      },
      score: {
        type: Number,
        required: true,
      },
      submitTime: {
        type: Date,
        required: true,
      },
      attempt: {
        type: String,
        ref: `Attempt_${id}`,
        required: true,
      },
      question: {
        type: String,
        ref: `Question_${id}`,
        required: true,
      },
    });

    return mongoose.model(`Response_${id}`, schema, `response_${id}`);
  }
}

module.exports = ModelsGenerator;
