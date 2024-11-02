const { StatusCodes } = require("http-status-codes");

const { HttpError } = require("../errors");
const { validateIds, validatePage, validateLimit } = require("../validations");
const { QuizVersionMapper } = require("../mappers");
const { ModelsGenerator } = require("../models");

class QuizVersionService {
  // usecases

  static async getVersion(collectionId, quizId, versionId) {
    validateIds({ quizId, versionId });

    const { Quiz, QuizVersion } = ModelsGenerator.generate(collectionId);

    await this.#checkIfQuizExists(Quiz, quizId);

    const version = await this.#getVersionForQuizIfItExists(
      QuizVersion,
      quizId,
      versionId
    );

    return QuizVersionMapper.toDTO(version);
  }

  static async getVersions(
    collectionId,
    quizId,
    { page = 1, limit = 20 } = {}
  ) {
    validateIds({ quizId });

    const { Quiz, QuizVersion } = ModelsGenerator.generate(collectionId);

    await this.#checkIfQuizExists(Quiz, quizId);

    validatePage(page);
    validateLimit(limit);

    page = Number(page);
    limit = Number(limit);

    const versions = await QuizVersion.find({ quiz: quizId })
      .sort({ createTime: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const count = await QuizVersion.countDocuments({
      quiz: quizId,
    });

    return {
      versions: versions.map((version) => QuizVersionMapper.toDTO(version)),
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

  static async #getVersionForQuizIfItExists(model, quizId, versionId) {
    const version = await model.findOne({
      _id: versionId,
      quiz: quizId,
    });

    if (!version) {
      throw new HttpError(
        StatusCodes.NOT_FOUND,
        "There is no version with this id for this quiz."
      );
    }

    return version;
  }
}

module.exports = QuizVersionService;
