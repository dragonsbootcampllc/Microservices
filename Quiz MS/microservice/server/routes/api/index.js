const { Router } = require("express");

const {
  QuizController,
  QuizQuestionController,
  QuizVersionController,
  QuizVersionQuestionController,
  UserQuizController,
  UserQuizAttemptController,
  UserAttemptController,
  UserAttemptQuestionController,
  UserAttemptResponseController,
  UserAttemptAnalysisController,
  // UserQuizAnalysisController,
} = require("../../controllers");

const router = Router();

// Quiz

router.post("/quizzes", QuizController.createQuiz);

router.get("/quizzes", QuizController.getQuizzes);

router.patch("/quizzes/:quizId", QuizController.updateQuiz);

router.get("/quizzes/:quizId", QuizController.getQuiz);

router.post("/quizzes/:quizId/publish", QuizController.publishQuiz);

router.post("/quizzes/:quizId/draft", QuizController.draftQuiz);

router.post("/quizzes/:quizId/archive", QuizController.archiveQuiz);

// Quiz - Question

router.post(
  "/quizzes/:quizId/questions",
  QuizQuestionController.createQuestion
);

router.get("/quizzes/:quizId/questions", QuizQuestionController.getQuestions);

router.patch(
  "/quizzes/:quizId/questions/:questionId",
  QuizQuestionController.updateQuestion
);

router.delete(
  "/quizzes/:quizId/questions/:questionId",
  QuizQuestionController.deleteQuestion
);
router.get(
  "/quizzes/:quizId/questions/:questionId",
  QuizQuestionController.getQuestion
);

// Quiz - Version

router.get("/quizzes/:quizId/versions", QuizVersionController.getVersions);

router.get(
  "/quizzes/:quizId/versions/:versionId",
  QuizVersionController.getVersion
);

// Quiz - Version - Question

router.get(
  "/quizzes/:quizId/versions/:versionId/questions",
  QuizVersionQuestionController.getQuestions
);

router.get(
  "/quizzes/:quizId/versions/:versionId/questions/:questionId",
  QuizVersionQuestionController.getQuestion
);

//  User - Quiz

router.post(
  "/users/:userId/quizzes/:quizId/start",
  UserQuizController.startAttempt
);

// User - Quiz - Attempt

router.get(
  "/users/:userId/quizzes/:quizId/attempts",
  UserQuizAttemptController.getAttempts
);

// User - Attempt

router.get("/users/:userId/attempts", UserAttemptController.getAttempts);

router.get(
  "/users/:userId/attempts/:attemptId",
  UserAttemptController.getAttempt
);

router.post(
  "/users/:userId/attempts/:attemptId/end",
  UserAttemptController.endAttempt
);

// User - Attempt - Question

router.get(
  "/users/:userId/attempts/:attemptId/questions",
  UserAttemptQuestionController.getQuestions
);

router.get(
  "/users/:userId/attempts/:attemptId/questions/:questionId",
  UserAttemptQuestionController.getQuestion
);

router.post(
  "/users/:userId/attempts/:attemptId/questions/:questionId/submit",
  UserAttemptQuestionController.submitAnswer
);

// User - Attempt - Response

router.get(
  "/users/:userId/attempts/:attemptId/responses",
  UserAttemptResponseController.getResponses
);

router.get(
  "/users/:userId/attempts/:attemptId/responses/:responseId",
  UserAttemptResponseController.getResponse
);

router.get(
  "/users/:userId/attempts/:attemptId/analysis",
  UserAttemptAnalysisController.getAnalysis
);

/*

router.get(
  "/users/:userId/quizzes/:quizId/analysis",
  UserQuizAnalysisController.getAnalysis
);

*/

module.exports = router;
