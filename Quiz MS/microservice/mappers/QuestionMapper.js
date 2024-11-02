class QuestionMapper {
  static toDTO(question, { answerIncluded = true } = {}) {
    const dto = {
      id: question._id,
      type: question.type,
      text: question.text,
      options: question.options,
      answer: question.answer,
      points: question.points,
    };

    if (!answerIncluded) {
      delete dto.answer;
    }

    return dto;
  }
}

module.exports = QuestionMapper;
