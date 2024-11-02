const colors = require("colors/safe");
const { ClientService } = require("../../services");

const createClient = async (data) => {
  const { name } = data;

  const credentials = await ClientService.createClient({ name });

  console.log(
    colors.green.bold("[success]") +
      " Use these creadentials to get an access_token"
  );

  console.log(credentials);
};

module.exports = createClient;
