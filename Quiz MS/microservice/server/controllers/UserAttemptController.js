const asyncHandler = require("express-async-handler");
const { StatusCodes } = require("http-status-codes");

const { UserAttemptService } = require("../../services");

class UserAttemptController {
  static endAttempt = asyncHandler(async (req, res) => {
    const client = req.client;
    const { userId, attemptId } = req.params;

    const attempt = await UserAttemptService.endAttempt(
      client.id,
      userId,
      attemptId
    );

    res.status(StatusCodes.OK).json({
      data: {
        attempt,
      },
    });
  });

  static getAttempt = asyncHandler(async (req, res) => {
    const client = req.client;
    const { userId, attemptId } = req.params;

    const attempt = await UserAttemptService.getAttempt(
      client.id,
      userId,
      attemptId
    );

    res.status(StatusCodes.OK).json({
      data: {
        attempt,
      },
    });
  });

  static getAttempts = asyncHandler(async (req, res) => {
    const client = req.client;
    const { userId } = req.params;
    const { page, limit } = req.query;

    const { attempts, pagination } = await UserAttemptService.getAttempts(
      client.id,
      userId,
      { page, limit }
    );

    res.status(StatusCodes.OK).json({
      data: {
        attempts,
      },
      metadata: {
        pagination,
      },
    });
  });
}

module.exports = UserAttemptController;
