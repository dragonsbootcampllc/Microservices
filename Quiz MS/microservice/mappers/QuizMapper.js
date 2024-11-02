class QuizMapper {
  static toDTO(quiz, version) {
    return {
      id: quiz._id,
      status: quiz.status,
      version: this.#toQuizVersionDTO(version),
    };
  }

  static #toQuizVersionDTO(version) {
    return {
      id: version._id,
      number: version.number,
      title: version.title,
      description: version.description,
      duration: version.duration,
    };
  }
}

module.exports = QuizMapper;
