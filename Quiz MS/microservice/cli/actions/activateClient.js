const colors = require("colors/safe");
const { ClientService } = require("../../services");

const activateClient = async (id) => {
  const client = await ClientService.activateClient(id);

  console.log(
    colors.green.bold("[success]") + ` Client ${client.id} is now active`
  );
};

module.exports = activateClient;
