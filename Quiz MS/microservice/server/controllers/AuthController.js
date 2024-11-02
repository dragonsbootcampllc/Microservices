const asyncHandler = require("express-async-handler");
const { StatusCodes } = require("http-status-codes");

const { AuthService } = require("../../services");

class AuthController {
  static generateAccessToken = asyncHandler(async (req, res) => {
    const { grant_type, client_id, client_secret } = req.body;

    const token = await AuthService.generateAccessToken(
      grant_type,
      client_id,
      client_secret
    );

    return res.status(StatusCodes.OK).json({
      access_token: token,
      token_type: "Bearer",
      expires_in: 3600,
    });
  });
}

module.exports = AuthController;
