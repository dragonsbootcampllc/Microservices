const { Router } = require("express");
const { StatusCodes } = require("http-status-codes");

const { HttpError } = require("../../errors");
const { AuthController } = require("../controllers");
const { authenticate } = require("../middlewares");

const apiRoutes = require("./api");

const router = Router();

router.post("/oauth/token", AuthController.generateAccessToken);

router.use("/api", authenticate, apiRoutes);

router.use((req, res) => {
  throw new HttpError(
    StatusCodes.NOT_FOUND,
    `The requested endpoint '${req.originalUrl}' was not found.`
  );
});

// Error Handling

const errorHandler = (error, req, res, next) => {
  if (error instanceof HttpError) {
    return res.status(error.statusCode).json({
      message: error.message,
    });
  }

  console.error(error);

  res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
    success: false,
    message: "An unexpected error occurred on the server.",
  });
};

router.use(errorHandler);

module.exports = router;
