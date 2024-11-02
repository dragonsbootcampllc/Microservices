const { StatusCodes } = require("http-status-codes");
const validator = require("validator");

const { HttpError } = require("../errors");
const validateLimit = (limit) => {
  if (!validator.isInt(String(limit), { min: 1 })) {
    throw new HttpError(
      StatusCodes.BAD_REQUEST,
      `Invalid "limit": It must be a positive integer.`
    );
  }
};

module.exports = validateLimit;
