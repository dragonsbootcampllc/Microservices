class ClientMapper {
  static toDTO(client) {
    return {
      id: client._id,
      name: client.name,
      active: client.active,
    };
  }
}

module.exports = ClientMapper;
