const colors = require("colors/safe");
const { ClientService } = require("../../services");

const regenerateClientCredentials = async (id) => {
  const credentials = await ClientService.regenerateClientCredentials(id);

  console.log(
    colors.green.bold("[success]") +
      " Use these creadentials to get an access_token"
  );

  console.log(credentials);
};

module.exports = regenerateClientCredentials;
