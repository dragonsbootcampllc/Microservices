const colors = require("colors/safe");
const { ClientService } = require("../../services");

const getClient = async (clientId) => {
  const client = await ClientService.getClient(clientId);

  console.log(colors.green.bold("[success]"));
  console.log(client);
};

module.exports = getClient;
