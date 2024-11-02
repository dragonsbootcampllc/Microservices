const { StatusCodes } = require("http-status-codes");
const validator = require("validator");

const { HttpError } = require("../errors");

const validatePage = (page) => {
  if (!validator.isInt(String(page), { min: 1 })) {
    throw new HttpError(
      StatusCodes.BAD_REQUEST,
      `Invalid "page": It must be a positive integer.`
    );
  }
};

module.exports = validatePage;
