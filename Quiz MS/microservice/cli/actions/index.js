const createClient = require("./createClient");
const renameClient = require("./renameClient");
const regenerateClientCredentials = require("./regenerateClientCredentials");
const activateClient = require("./activateClient");
const deactivateClient = require("./deavtivateClient");
const getClient = require("./getClient");
const getClients = require("./getClients");

module.exports = {
  createClient,
  renameClient,
  regenerateClientCredentials,
  activateClient,
  deactivateClient,
  getClient,
  getClients,
};
