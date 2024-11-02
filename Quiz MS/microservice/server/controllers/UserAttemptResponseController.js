const asyncHandler = require("express-async-handler");
const { StatusCodes } = require("http-status-codes");

const { UserAttemptResponseService } = require("../../services");

class UserAttemptResponseController {
  static getResponse = asyncHandler(async (req, res) => {
    const client = req.client;
    const { userId, attemptId, responseId } = req.params;

    const response = await UserAttemptResponseService.getResponse(
      client.id,
      userId,
      attemptId,
      responseId
    );

    res.status(StatusCodes.OK).json({
      data: {
        response,
      },
    });
  });

  static getResponses = asyncHandler(async (req, res) => {
    const client = req.client;
    const { userId, attemptId } = req.params;
    const { page, limit } = req.query;

    const { responses, pagination } =
      await UserAttemptResponseService.getResponses(
        client.id,
        userId,
        attemptId,
        { page, limit }
      );

    res.status(StatusCodes.OK).json({
      data: {
        responses,
      },
      metadata: {
        pagination,
      },
    });
  });
}

module.exports = UserAttemptResponseController;
