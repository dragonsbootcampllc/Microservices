class QuizVersionMapper {
  static toDTO(version) {
    return {
      id: version._id,
      number: version.number,
      title: version.title,
      description: version.description,
      duration: version.duration,
      active: version.active,
    };
  }
}

module.exports = QuizVersionMapper;
