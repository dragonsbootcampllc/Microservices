const colors = require("colors/safe");
const { ClientService } = require("../../services");

const renameClient = async (id, name) => {
  const client = await ClientService.updateClient(id, { name });

  console.log(colors.green.bold("[success]"));
  console.log(client);
};

module.exports = renameClient;
