const colors = require("colors/safe");
const { ClientService } = require("../../services");

const getClients = async ({ page, limit }) => {
  const { clients, pagination } = await ClientService.getClients({
    page,
    limit,
  });

  console.log(colors.green.bold("[success]"));

  console.log({
    clients,
    pagination,
  });
};

module.exports = getClients;
