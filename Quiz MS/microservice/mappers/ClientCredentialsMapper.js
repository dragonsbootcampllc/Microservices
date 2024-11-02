class ClientCredentialsMapper {
  static toDTO(credentials) {
    return {
      client_id: credentials.client_id,
      client_secret: credentials.client_secret,
    };
  }
}
module.exports = ClientCredentialsMapper;
