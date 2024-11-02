const { StatusCodes } = require("http-status-codes");
const validator = require("validator");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");

const { HttpError } = require("../errors");
const { validateIds, validatePage, validateLimit } = require("../validations");
const { ClientMapper, ClientCredentialsMapper } = require("../mappers");
const { Client } = require("../models");

class ClientService {
  // usecases

  static async createClient(data = {}) {
    const { name } = data;

    await this.#validateName(name);

    const client_id = crypto.randomBytes(20).toString("hex");
    const client_secret = crypto.randomBytes(20).toString("hex");

    const client_hash = bcrypt.hashSync(client_secret, bcrypt.genSaltSync());

    const now = Date.now();

    const client = new Client({
      name,
      client_id,
      client_hash,
      active: true,
      createTime: now,
      updateTime: now,
    });

    await client.save();

    return ClientCredentialsMapper.toDTO({ client_id, client_secret });
  }

  static async updateClient(clientId, data = {}) {
    validateIds({ clientId });

    const { name } = data;

    const client = await this.#getClientIfExists(clientId);

    if (name !== undefined) {
      this.#validateName(name);
      client.name = name;
    }

    client.updateTime = Date.now();

    await client.save();

    return ClientMapper.toDTO(client);
  }

  static async regenerateClientCredentials(clientId) {
    validateIds({ clientId });

    const client = await this.#getClientIfExists(clientId);

    const client_id = crypto.randomBytes(20).toString("hex");
    const client_secret = crypto.randomBytes(20).toString("hex");

    const client_hash = bcrypt.hashSync(client_secret, bcrypt.genSaltSync());

    client.client_id = client_id;
    client.client_hash = client_hash;

    client.updateTime = Date.now();

    await client.save();

    return ClientCredentialsMapper.toDTO({ client_id, client_secret });
  }

  static async activateClient(clientId) {
    validateIds({ clientId });

    const client = await this.#getClientIfExists(clientId);

    if (client.active) {
      throw new HttpError(
        StatusCodes.BAD_REQUEST,
        "This client is already active."
      );
    }

    client.active = true;
    client.updateTime = Date.now();

    await client.save();

    return ClientCredentialsMapper.toDTO(client);
  }

  static async deactivateClient(clientId) {
    validateIds({ clientId });

    const client = await this.#getClientIfExists(clientId);

    if (!client.active) {
      throw new HttpError(
        StatusCodes.BAD_REQUEST,
        "This client is already inactive."
      );
    }

    client.active = false;
    client.updateTime = Date.now();

    await client.save();

    return ClientCredentialsMapper.toDTO(client);
  }

  static async getClient(clientId) {
    validateClientIds({ clientId });

    const client = await this.#getClientIfExists(clientId);

    return ClientMapper.toDTO(client);
  }

  static async getClients({ page = 1, limit = 20 } = {}) {
    validatePage(page);
    validateLimit(limit);

    page = Number(page);
    limit = Number(limit);

    const clients = await Client.find({})
      .sort({ createTime: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const count = await Client.countDocuments({});

    return {
      clients: clients.map((client) => ClientMapper.toDTO(client)),
      pagination: {
        page: count ? page : 0,
        pageCount: Math.ceil(count / limit),
      },
    };
  }

  // validations

  static async #validateName(name) {
    if (
      typeof name !== "string" ||
      !validator.isLength(name, { min: 1, max: 50 })
    ) {
      throw new HttpError(
        StatusCodes.BAD_REQUEST,
        'Invalid "name": It must be a string between 1 and 50 characters.'
      );
    }
  }

  // helpers

  static async #getClientIfExists(clientId) {
    const client = await Client.findById(clientId);

    if (!client) {
      throw new HttpError(
        StatusCodes.NOT_FOUND,
        "There is no client with this id."
      );
    }

    return client;
  }
}

module.exports = ClientService;
