class ResponseMapper {
  static toDTO(response, question) {
    return {
      id: response._id,
      answer: response.answer,
      score: response.score,
      submitTime: response.submitTime,
      question: this.#toQuestionDTO(question),
    };
  }

  static #toQuestionDTO(question) {
    return {
      id: question._id,
      type: question.type,
      text: question.text,
      options: question.options,
      answer: question.answer,
      points: question.points,
    };
  }
}

module.exports = ResponseMapper;
