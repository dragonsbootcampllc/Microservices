const { StatusCodes } = require("http-status-codes");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const { HttpError } = require("../errors");
const { ClientMapper } = require("../mappers");
const { Client } = require("../models");

const JWT_SECRET = process.env.JWT_SECRET;

class AuthService {
  // usecases

  static async generateAccessToken(grant_type, client_id, client_secret) {
    if (typeof grant_type !== "string") {
      throw new HttpError(
        StatusCodes.BAD_REQUEST,
        'Invalid "grant_type": It must be a string.'
      );
    }

    if (typeof client_id !== "string") {
      throw new HttpError(
        StatusCodes.BAD_REQUEST,
        'Invalid "client_id": It must be a string.'
      );
    }

    if (typeof client_secret !== "string") {
      throw new HttpError(
        StatusCodes.BAD_REQUEST,
        'Invalid "client_secret": It must be a string.'
      );
    }

    if (grant_type !== "client_credentials") {
      throw new HttpError(
        StatusCodes.BAD_REQUEST,
        'Invalid or unsupported "grant_type".'
      );
    }

    try {
      const client = await Client.findOne({ client_id });

      if (
        !client ||
        !client.active ||
        !bcrypt.compareSync(client_secret, client.client_hash)
      ) {
        throw new Error();
      }
    } catch (error) {
      throw new HttpError(
        StatusCodes.UNAUTHORIZED,
        'Invalid "client_id" or "client_secret".'
      );
    }

    return jwt.sign({ client_id }, JWT_SECRET);
  }

  static async authenticateClientByAccessToken(access_token) {
    try {
      const { client_id } = jwt.decode(access_token, JWT_SECRET);

      const client = await Client.findOne({ client_id });

      if (!client || !client.active) {
        throw new Error();
      }

      return ClientMapper.toDTO(client);
    } catch (error) {
      throw new HttpError(
        StatusCodes.UNAUTHORIZED,
        'Invalid or expired "access_token".'
      );
    }
  }
}

module.exports = AuthService;
