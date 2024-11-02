class AttemptMapper {
  static toDTO(attempt, quiz, version) {
    return {
      id: attempt._id,
      startTime: attempt.startTime,
      endTime: attempt.endTime,
      active: attempt.active,
      quiz: this.#toQuizDTO(quiz, version),
    };
  }

  static #toQuizDTO(quiz, version) {
    return {
      id: quiz._id,
      version: this.#toQuizVersionDTO(version),
    };
  }

  static #toQuizVersionDTO(version) {
    return {
      id: version._id,
      number: version.number,
      title: version.title,
      descripton: version.descripton,
      duration: version.duration,
    };
  }
}

module.exports = AttemptMapper;
