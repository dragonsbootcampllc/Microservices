const asyncHandler = require("express-async-handler");
const { StatusCodes } = require("http-status-codes");

const { HttpError } = require("../../errors");
const { AuthService } = require("../../services");

const authenticate = asyncHandler(async (req, res, next) => {
  const header = req.headers["authorization"];

  if (!header) {
    throw new HttpError(
      StatusCodes.BAD_REQUEST,
      "Missing authorization header."
    );
  }

  const [scheme, access_token] = header.split(" ");

  if (scheme !== "Bearer" || !access_token) {
    throw new HttpError(
      StatusCodes.UNAUTHORIZED,
      "Invalid or missing authorization token."
    );
  }

  const client = await AuthService.authenticateClientByAccessToken(
    access_token
  );

  req.client = client;

  next();
});

module.exports = authenticate;
