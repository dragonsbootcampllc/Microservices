const AuthService = require("./AuthService");
const ClientService = require("./ClientService");
const QuizService = require("./QuizService");
const QuizQuestionService = require("./QuizQuestionService");
const QuizVersionService = require("./QuizVersionService");
const QuizVersionQuestionService = require("./QuizVersionQuestionService");
const UserQuizService = require("./UserQuizService");
const UserQuizAttemptService = require("./UserQuizAttemptService");
const UserAttemptService = require("./UserAttemptService");
const UserAttemptQuestionService = require("./UserAttemptQuestionService");
const UserAttemptResponseService = require("./UserAttemptResponseService");
const UserAttemptAnalysisService = require("./UserAttemptAnalysis");

module.exports = {
  ClientService,
  AuthService,
  QuizService,
  QuizQuestionService,
  QuizVersionService,
  QuizVersionQuestionService,
  UserQuizService,
  UserQuizAttemptService,
  UserAttemptService,
  UserAttemptQuestionService,
  UserAttemptResponseService,
  UserAttemptAnalysisService,
};
