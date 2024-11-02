const { StatusCodes } = require("http-status-codes");
const validator = require("validator");

const { HttpError } = require("../errors");

const validateIds = (ids = {}) => {
  for (const key in ids) {
    if (!validator.isUUID(ids[key])) {
      throw new HttpError(
        StatusCodes.BAD_REQUEST,
        `Invalid "${key}": It must be a valid UUID.`
      );
    }
  }
};

module.exports = validateIds;
