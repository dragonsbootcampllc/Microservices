const colors = require("colors/safe");
const { ClientService } = require("../../services");

const deactivateClient = async (id) => {
  const client = await ClientService.deactivateClient(id);

  console.log(
    colors.green.bold("[success]") + ` Client ${client.id} is now inactive`
  );
};

module.exports = deactivateClient;
